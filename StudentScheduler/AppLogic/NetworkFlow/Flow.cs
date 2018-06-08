using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic.NetworkFlow
{
    public class Flow
    {
        public List<Node> Nodes { get; private set; }

        private User teacher;
        private List<User> students;

        // TODO: Student name must NOT contain this char -> :
        public Flow(User teacher, List<User> students)
        {
            this.teacher = teacher;
            this.students = students;
            this.Nodes = new List<Node>();
        }

        public void DEBUG_ClearNodes()
        {
            Nodes.Clear();
        }

        /// <summary>
        /// Gets result using flows. This method will set student assigned times and return array of minutes, when is break time each day
        /// </summary>
        /// <returns></returns>
        public int[] GetResult()
        {
            int[] breaks = new int[5];

            for (int day = 0; day < 5; day++)
            {
                Log.Write($"===================DAY: {day}==============", Log.Severity.Info);
                BuildGraph(day);
                Start();
                Log.Write("Done...", Log.Severity.Info);
                var studentsToday = GetResultFromGraph(day);
                // If there are more then three students today:
                if (studentsToday.Count > 3)
                {
                    // Save first three student times
                    for (int i = 0; i < 3; i++) ApplyStudent(studentsToday[i]);
                    // Disable minutes and record break time
                    breaks[day] = studentsToday[2].timeStart + 50;
                    // Start again (remove first two students and their times)
                    BuildGraph(day, breaks[day], breaks[day] + Plan.breakAfterLessonsLength);
                    Start();
                    studentsToday = GetResultFromGraph(day);
                }
                else
                {
                    breaks[day] = int.MaxValue;
                }

                // Apply all students
                foreach (AssignmentPreview result in studentsToday) ApplyStudent(result);
            }

            Log.Write("Break: " + String.Join(", ", breaks), Log.Severity.Info);

            return breaks;
        }

        private void BuildGraph(int day, int bannedTimespanFrom = -1, int bannedTimespanTo = -1)
        {
            Nodes.Clear();
            // Add root node
            Node root = new Node("Input", -1, Node.NodeType.Input);
            Nodes.Add(root);

            // Add all students nodes
            foreach (User student in students)
            {
                if (student.assigned || !student.daysAvailable[day])
                    continue;

                // TODO: Error when multiple students with same name
                Node studentNode = new Node("Student:" + student.name, -1, Node.NodeType.Default);
                AddNodeAfter("Input", studentNode);
            }

            // Prepare time chunk node
            Node timeChunk = new Node("TimeChunk", -1, Node.NodeType.Default);

            var occupiedTimesToday = students.Where(student => student.assignedDay == day).Select(student => student.assignedMinutes);

            // Add all times nodes
            for (int time = 0; time < 24 * 60; time += 5)
            {
                // If the time is banned or someone already positioned used the time, skip to next time
                if ((time >= bannedTimespanFrom && time <= bannedTimespanTo) ||
                    occupiedTimesToday.Where(occTime => Math.Abs(occTime - time) < 50).Count() > 0)
                    continue;

                if (teacher.minutesFromAvailable[day] <= time && teacher.minutesToAvailable[day] - Plan.lessonLength >= time)
                {

                    var studentsAtThisTime = /* Students that have time right now */ students.Where(student => !student.assigned &&
                                                                                                                student.daysAvailable[day] &&
                                                                                                                student.minutesFromAvailable[day] <= time &&
                                                                                                                student.minutesToAvailable[day] - Plan.lessonLength >= time);

                    Node timeNode = new Node("Time:" + time, time, Node.NodeType.Default);
                    foreach (User student in studentsAtThisTime)
                    {
                        AddNodeAfter("Student:" + student.name, timeNode);
                    }
                    AddNodeAfter("Time:" + time, timeChunk);
                }
            }

            // Connect Time Chunk with output
            Node output = new Node("Output", -1, Node.NodeType.Output);
            AddNodeAfter("TimeChunk", output);

            // Change edge between TimeChunk(Node) and Output to TimeChunk(Edge)
            TimeChunk timeChunkEdge = new TimeChunk(timeChunk, output);
            timeChunk.OutputEdges.Clear();
            timeChunk.OutputEdges.Add(timeChunkEdge);
            output.InputEdges.Clear();
            output.InputEdges.Add(timeChunkEdge);
        }

        private void AddNodeAfter(string identifier, Node newNode)
        {
            foreach (Node node in Nodes)
            {
                if (node.Identifier == identifier)
                {
                    Edge newEdge = new Edge(1, 0, node, newNode);
                    node.OutputEdges.Add(newEdge);
                    newNode.InputEdges.Add(newEdge);
                    break;
                }
            }
            if (!Nodes.Contains(newNode))
                Nodes.Add(newNode);
        }

        private void Start()
        {
            // While we are creating new flow, keep doing it
            while (CreateNewFlow()) ;
        }

        // Return value: did we create new flow?
        private bool OLD_CreateNewFlow()
        {
            // Let's create dictionary of Node : SourceNode
            //  +----+----+----+-----+-----+
            //  | A1 | A2 | B1 | TCH | OUT | 
            //  +----+----+----+-----+-----+
            //  | I  | I  | A1 | B1  | TCH |
            //  +----+----+----+-----+-----+

            Dictionary<Node, Node> FlowPath = new Dictionary<Node, Node>(Nodes.Count);
            for (int i = 1; i < Nodes.Count; i++) FlowPath.Add(Nodes[i], null); // Add all nodes into FlowPath !except for root node

            Queue<Node> NodesToProcess = new Queue<Node>();
            NodesToProcess.Enqueue(Nodes[0]); // Mark root node as to-process

            HashSet<Node> AlreadyAddedNodes = new HashSet<Node>();
            AlreadyAddedNodes.Add(Nodes[0]);
            while (NodesToProcess.Count > 0)
            {
                // Get all nodes that still have avaiable flow space in them and aren't occupied (in FlowPath)
                Node node = NodesToProcess.Dequeue();

                // Nodes that are accessable from this node
                List<Node> avaiableNodes = new List<Node>(node.OutputEdges.Count + node.InputEdges.Count);

                bool doInputEdges = true;
                bool areInputEdgesForbidden = false;
                List<Node> renderedPath = RenderPath(Nodes.First(), node, FlowPath);
                foreach (Edge outputEdge in node.OutputEdges)
                {
                    // Kdyz jdu dopredu, musim zkontrolovat, jestli tenhle timeNode neni v rozmezi 50 minut od neceho, cim jsem prosel
                    if (outputEdge.To.Value != -1 /* If target node is TimeNode */ &&
                        renderedPath.Where(n => n.Value != -1 && Math.Abs(outputEdge.To.Value - n.Value) < Plan.lessonLength).Count() > 0 /* And count of nodes that I passed thru and are < 50 mintues away is > 0 */)
                    {
                        Log.Write("I've skipped outputEdge with [toNode]: " + outputEdge.To.Identifier, Log.Severity.Critical);
                        continue;
                    }

                    int flow = outputEdge.GetCurrentFlow(renderedPath, this, "OutputEdges");
                    if (flow > 1)
                        areInputEdgesForbidden = true;
                    if (flow == 0)
                    {
                        avaiableNodes.Add(outputEdge.To);
                        doInputEdges = false;
                    }
                }
                if (doInputEdges && !areInputEdgesForbidden)
                {
                    foreach (Edge inputEdge in node.InputEdges)
                    {
                        // If this possible node is within 50-mintue range within another node in path, skip this
                        /*if (inputEdge.From.Value != -1 && renderedPath.Where(n => n.Value != -1 && Math.Abs(n.Value - inputEdge.From.Value) < Plan.lessonLength).Count() > 0)
                            continue;*/ // Tohle nic neresi

                        // RESENI: Tohle budu prochazet, JENOM kdyz nenajdu zadnou cestu pomoci OutputEdge //TODO: Mozne nefunkcni pro neco?
                        // Budu hledat cestu JENOM mezi hranami grafu, do kterych MUZE ten student, ktery ma cestu, kterou mu kradu; jit.

                        // Sem se dostanu jenom v pripade, ze vsechny OutputNody z TimeChunku(Node) jsou odmitnuty -> [node] je vzdy TimeChunk

                        if (node.Identifier != "TimeChunk")
                        {
                            Log.Write($"!!! NODE ISN'T TIME CHUNK !!! \"{node.Identifier}\" ({node.Value})", Log.Severity.Critical);
                        }

                        // Najdu si studenta, ktery ho blokuje a najdu mu jinou cestu.
                        // Tenhle novyStudent si vezme cestu stareho studenta (^^)



                        if (inputEdge is TimeChunk)
                        {
                            Log.Write("I found input edge that was Time Chunk; from = " + inputEdge.To.Identifier, Log.Severity.Warning);
                        }

                        // Why?
                        if (renderedPath.Count >= 2 && inputEdge.From == renderedPath[renderedPath.Count - 2])
                            continue;

                        int flow = inputEdge.GetCurrentFlow(renderedPath, this, "InputEdges");
                        if (flow == 1)
                        {
                            avaiableNodes.Add(inputEdge.From);
                            Log.Write("I just used backflow. Here's full path: " + String.Join(" , ", renderedPath.Select(n => $"\"{n.Identifier}\"({n.Value})")) + ". The new node is \"" + inputEdge.From.Identifier + "\"(" + inputEdge.From.Value + ")", Log.Severity.Critical);
                        }


                    }
                }

                // Fill all nodes that are accessible from this node
                foreach (Node nodeToGoThrough in avaiableNodes)
                {
                    if (AlreadyAddedNodes.Contains(nodeToGoThrough))
                        continue;

                    AlreadyAddedNodes.Add(nodeToGoThrough);
                    FlowPath[nodeToGoThrough] = node;
                    NodesToProcess.Enqueue(nodeToGoThrough);
                }
            }

            // Now, I (probably) have flow
            Log.Write(this.ToString(), Log.Severity.Info);
            DEBUG_WriteFlowPath(FlowPath);
            var TimeChunk = FlowPath.Keys.Where(x => x.Identifier == "TimeChunk").SingleOrDefault();
            if (TimeChunk == null || FlowPath[TimeChunk] == null)
            {
                Log.Write("No flow", Log.Severity.Info);
                // No flow
                return false;
            }
            else
            {
                Log.Write("Applying flow", Log.Severity.Info);
                ApplyFlow(Nodes.First(), TimeChunk, FlowPath);
                return true;
            }

            /*// First of all, we have to create the dictionary, so we know, what the path is
            Dictionary<Node, Node> FlowPath = new Dictionary<Node, Node>();
            // Populate the dictionary with nodes
            foreach (Node node in Nodes) FlowPath.Add(node, null);

            // Here, we create Queue, that holds nodes, that we will want to work with
            // Plus list of nodes which were already added to Queue, so we don't process one node multiple times
            Queue<Node> nodesToProcess = new Queue<Node>();
            // And let's enqueue root node
            nodesToProcess.Enqueue(Nodes[0]);
            // Here's the list of added nodes
            HashSet<Node> alreadyAddedNodes = new HashSet<Node>();
            // And add the root node
            alreadyAddedNodes.Add(Nodes[0]);

            // Now we build the flow: 

            // While we have something to process in queue, select the node...
            while(nodesToProcess.Count > 0)
            {
                Node nodeToProcess = nodesToProcess.Dequeue();

                // TODO: The paths used in edge.GetCurrentFlow do NOT contain the current node -> problem?
                
                // First of all, save current path from this node to input, inverted. This is used to calculate flow through time chunk edges
                List<Node> path = RenderPath(Nodes[0], nodeToProcess, FlowPath);
                // What we do here? Get collection of edges that goes from this node
                var edgesFromThisNode = nodeToProcess.OutputEdges.Where(edge => FlowPath[edge.To] == null && edge.GetCurrentFlow(path, this, "Getting output edges") == 0);
                // Now, we get edges from this node to it's inputs, but not the inputs that we already went through. 
                var edgesToThisNode = nodeToProcess.InputEdges.Where(edge => FlowPath[edge.From] == null && !path.Contains(edge.From) && edge.GetCurrentFlow(path, this, "Getting input edges") == 1);

                // Add the nodes we got into FlowPath
                edgesFromThisNode.ForEach(edge => FlowPath[edge.To] = nodeToProcess);
                edgesToThisNode.ForEach(edge => FlowPath[edge.From] = nodeToProcess);

                // Add these nodes to to-process list
                edgesFromThisNode.ForEach(edge => nodesToProcess.Enqueue(edge.To));
                edgesFromThisNode.ForEach(edge => nodesToProcess.Enqueue(edge.From));
            }

            // Now, we may have the flow
            // Just check the output
            Node output = Nodes.Where(node => node.Identifier == "Output").Single();
            // If the output has something in FlowPath, we have flow!
            if(FlowPath[output] != null)
            {
                // Apply flow
                ApplyFlow(Nodes.First(), output, FlowPath);
                return true;
            }
            else
            {
                return false;
            }*/
        }

        private bool CreateNewFlow()
        {
            // First of all, let's create a dictionary, when we'll store currently chosen path
            Dictionary<Node, Node> NodesPath = new Dictionary<Node, Node>();
            // Add keys and null
            Nodes.ForEach(node => NodesPath.Add(node, null));

            // Let's start processing nodes
            Queue<Node> nodesToProcess = new Queue<Node>();
            HashSet<Node> alreadyProcessedNodes = new HashSet<Node>();
            nodesToProcess.Enqueue(Nodes[0]);
            alreadyProcessedNodes.Add(Nodes[0]);

            // While there's something to process, process it
            while (nodesToProcess.Count > 0)
            {
                // Start by getting node from the queue
                Node node = nodesToProcess.Dequeue();
                // And get current path
                List<Node> path = RenderPath(Nodes[0], node, NodesPath);
                Log.Write(String.Join(" -> ", path.Select(x => x.Identifier)), Log.Severity.Info); // Debug: write currently rendered path
                // Now we need to get next nodes from this node...
                var nextNodes = node.OutputEdges.Where(edge => edge.GetCurrentFlow(path, this, "Getting output nodes") == 0);
                // And get previous nodes
                var previousNodes = node.InputEdges.Where(edge => edge.GetCurrentFlow(path, this, "Getting input nodes") == 1);
                // Filter the nodes to only allow those that are not in alreadyProcessedNodes
                nextNodes = nextNodes.Where(newNode => !alreadyProcessedNodes.Contains(newNode.To));
                previousNodes = previousNodes.Where(newNode => !alreadyProcessedNodes.Contains(newNode.From));
                // Add all these nodes to queue, list of processed nodes and the dictionary
                foreach (Node newNode in nextNodes.Select(edge => edge.To).Union(previousNodes.Select(edge => edge.From)))
                {
                    nodesToProcess.Enqueue(newNode);
                    alreadyProcessedNodes.Add(newNode);
                    NodesPath[newNode] = node;
                }

                try
                {
                    Log.Write(nodesToProcess.Peek(), Log.Severity.Info);
                    Log.Write(NodesPath[nodesToProcess.Peek()] == null, Log.Severity.Info);
                    Log.Write(NodesPath[nodesToProcess.Peek()]?.Identifier, Log.Severity.Info);
                }
                catch { }
            }

            Log.Write(this.ToString(), Log.Severity.Info);
            DEBUG_WriteFlowPath(NodesPath);
            // If there is flow going through output, there is flow
            var output = NodesPath.Keys.Where(x => x.Identifier == "Output").SingleOrDefault();
            if (output == null || NodesPath[output] == null)
            {
                // No flow
                Log.Write("No flow", Log.Severity.Info);
                return false;
            }
            else
            {
                // Apply flow
                Log.Write("Applying flow", Log.Severity.Info);
                NewFlowApply(RenderPath(Nodes[0], output, NodesPath));
                return true;
            }
        }

        private void NewFlowApply(List<Node> path)
        {
            for (int i = 0; i < path.Count() - 1; i++)
            {
                // Select node:nextNode
                Node prevNode = path[i];
                Node nextNode = path[i + 1];

                // Now set the edge between them to the opposite value
                Edge edgeBetweenNodes = prevNode.OutputEdges.Union(prevNode.InputEdges).Where(edge => edge.From == nextNode || edge.To == nextNode).Single();
                if (!(edgeBetweenNodes is TimeChunk))
                {
                    edgeBetweenNodes.SetCurrentFlow(edgeBetweenNodes.GetCurrentFlow(null, null, "Flow Apply") == 0 ? 1 : 0);
                }
            }
        }

        private void DEBUG_WriteFlowPath(Dictionary<Node, Node> FlowPath)
        {
            string output = "Keys: " + String.Join(" | ", FlowPath.Keys.Select(x => x.Identifier));
            output += "\n";
            output += "Values: " + String.Join(" | ", FlowPath.Values.Select(x => x == null ? "---" : x.Identifier));
            Log.Write(output, Log.Severity.Info);
        }

        private List<Node> RenderPath(Node rootNode, Node endNode, Dictionary<Node, Node> flowPath)
        {
            List<Node> path = new List<Node>();
            path.Add(endNode);

            Node nextNode = endNode;
            while (nextNode != rootNode)
            {
                nextNode = flowPath[nextNode];
                path.Add(nextNode);
            }

            path.Reverse();
            return path;
        }

        private List<AssignmentPreview> GetResultFromGraph(int day)
        {
            Log.Write("Starting GetResultFromGraph", Log.Severity.Info);

            var timeNodes = Nodes.Where(node => node.Value != -1);

            var usedTimeNodes = timeNodes.Where(node => node.InputEdges.Count != 0);

            Log.Write("Time nodes total: " + usedTimeNodes.Count(), Log.Severity.Info);

            //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
            var edges = usedTimeNodes.Where(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetResult") == 1).Count() == 1)
                                     .Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetREsult2") == 1).Single());

            Log.Write("Time nodes with selected edge: " + edges.Count(), Log.Severity.Info);

            return edges.Select(edge => new AssignmentPreview()
            {
                assignedStudent = students.Where(student => student.name == edge.From.Identifier.Split(':')[1]).Single(),
                day = day,
                timeStart = edge.To.Value
            }).OrderBy(result => result.timeStart).ToList();
        }

        private void ApplyStudent(AssignmentPreview result)
        {
            result.assignedStudent.assigned = true;
            result.assignedStudent.assignedDay = result.day;
            result.assignedStudent.assignedMinutes = result.timeStart;
        }

        private void ApplyFlow(Node rootNode, Node endNode, Dictionary<Node, Node> flowPath)
        {
            Node nextNode = endNode;
            while (nextNode != rootNode)
            {
                EdgeInfo edge = GetEdgeInfo(nextNode, flowPath[nextNode]);

                if (edge.IsFromNode1ToNode2)
                {
                    edge.ResultEdge.SetCurrentFlow(0);
                    Log.Write($"Setting edge flow from {edge.ResultEdge.From.Identifier} to {edge.ResultEdge.To.Identifier} to 0", Log.Severity.Warning);
                }
                else
                {
                    edge.ResultEdge.SetCurrentFlow(1);
                    Log.Write($"Setting edge flow from {edge.ResultEdge.From.Identifier} to {edge.ResultEdge.To.Identifier} to 1", Log.Severity.Info);
                }

                nextNode = flowPath[nextNode];
            }
        }

        private EdgeInfo GetEdgeInfo(Node node1, Node node2)
        {
            EdgeInfo result = new EdgeInfo();
            Edge edg = node1.OutputEdges.Where(edge => edge.To == node2).FirstOrDefault();

            result.IsFromNode1ToNode2 = edg != null;

            if (edg == null)
            {
                edg = node1.InputEdges.Where(edge => edge.From == node2).FirstOrDefault();
            }

            result.ResultEdge = edg;

            return result;
        }

        private struct EdgeInfo
        {
            public Edge ResultEdge;
            public bool IsFromNode1ToNode2;
        }

        private struct AssignmentPreview
        {
            public int timeStart;
            public int day;
            public User assignedStudent;
        }



        public override string ToString()
        {
            string command = "graph LR\r\n";

            foreach (Node n in Nodes)
            {
                foreach (Edge outputEdge in n.OutputEdges)
                {
                    command += $"{outputEdge.From.Identifier} -->|{outputEdge.GetCurrentFlow(new Node[0], this, "ThisToString")}| {outputEdge.To.Identifier}\r\n";
                }
            }


            return command;
        }
    }
}

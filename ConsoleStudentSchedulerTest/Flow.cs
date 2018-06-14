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
                Console.WriteLine($"===================DAY: {day}==============");
                BuildGraph(day);
                Start();
                var studentsToday = GetResultFromGraph(day);
                // If there are more then three students today:
                if (studentsToday.Count > 3)
                {
                    // Save first three student times
                    for (int i = 0; i < 3; i++) ApplyStudent(studentsToday[i]);
                    // Disable minutes and record break time
                    breaks[day] = studentsToday[2].timeStart + 50;
                    // Start again (remove first two students and their times)
                    BuildGraph(day, breaks[day], breaks[day] + 15);
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

            Console.WriteLine("Break: " + String.Join(", ", breaks));

            return breaks;
        }

        private void BuildGraph(int day, int bannedTimespanFrom = -1, int bannedTimespanTo = -1)
        {
            return;

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

                if (teacher.minutesFromAvailable[day] <= time && teacher.minutesToAvailable[day] - 50 >= time)
                {

                    var studentsAtThisTime = /* Students that have time right now */ students.Where(student => !student.assigned &&
                                                                                                                student.daysAvailable[day] &&
                                                                                                                student.minutesFromAvailable[day] <= time &&
                                                                                                                student.minutesToAvailable[day] - 50 >= time);

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

        private bool CreateNewFlow()
        {
            // First of all, let's create a dictionary, when we'll store currently chosen path
            Dictionary<Node, NodesPathCollection> NodesPath = new Dictionary<Node, NodesPathCollection>();
            // Add keys and null
            Nodes.ForEach(node => NodesPath.Add(node, new NodesPathCollection()));

            // Let's start processing nodes
            Queue<Node> nodesToProcess = new Queue<Node>();
            nodesToProcess.Enqueue(Nodes[0]);
            NodesPath[Nodes[0]].Nodes.Add(new Node("Input Placeholder", -1, Node.NodeType.Input));

            // While there's something to process, process it
            while (nodesToProcess.Count > 0)
            {
                // Start by getting node from the queue
                Node node = nodesToProcess.Dequeue();

                if (node.Value == 110)
                {

                }

                // And get current path
                List<Node> path = RenderPath(Nodes[0], node, NodesPath);
                //Console.WriteLine(String.Join(" -> ", path.Select(x => x.Identifier))); // Debug: write currently rendered path
                // Now we need to get next nodes from this node...
                var nextNodes = node.OutputEdges.Where(edge => edge.GetCurrentFlow(path, this, "Getting output nodes") == 0);
                // And get previous nodes
                var previousNodes = node.InputEdges.Where(edge => edge.GetCurrentFlow(path, this, "Getting input nodes") == 1);
                // Filter the nodes to only allow those that are not in alreadyProcessedNodes
                nextNodes = nextNodes.Where(newNode => NodesPath[newNode.To].Nodes.Count == 0 || (newNode.To.Identifier == "TimeChunk" && NodesPath[newNode.To].SelectedNode == null));
                previousNodes = previousNodes.Where(newNode => NodesPath[newNode.From].Nodes.Count == 0);
                // Add all these nodes to queue
                var NodesToGoThrough = nextNodes.Select(edge => edge.To).Union(previousNodes.Select(edge => edge.From));
                foreach (Node newNode in NodesToGoThrough)
                {
                    nodesToProcess.Enqueue(newNode);
                    NodesPath[newNode].Nodes.Add(node);

                    if (newNode.Identifier == "TimeChunk")
                    {
                        // Check if the path may go through time chunk
                        bool canPass = newNode.OutputEdges[0].GetCurrentFlow(path, this, "Adding SelectedNode") == 0;

                        if (canPass)
                            NodesPath[newNode].SelectedNode = node;
                    }
                }
            }

            // Now, I (probably) have flow
            var output = NodesPath.Keys.Where(x => x.Identifier == "Output").SingleOrDefault();
            if (output == null || NodesPath[output].Nodes.Count == 0)
            {
                // No flow
                Console.WriteLine("Failure:");
                return false;
            }
            else
            {
                Console.WriteLine("Success");
                ApplyFlow(RenderPath(Nodes[0], output, NodesPath));
                Console.WriteLine(this);
                return true;
            }
        }

        private void ApplyFlow(List<Node> path)
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

        private List<Node> RenderPath(Node rootNode, Node endNode, Dictionary<Node, NodesPathCollection> flowPath)
        {
            int timeChunkNodeCounter = 0;
            List<Node> path = new List<Node>();
            path.Add(endNode);

            Node nextNode = endNode;
            while (nextNode != rootNode)
            {
                if (nextNode == null)
                    break;

                if (nextNode.Identifier == "TimeChunk")
                {
                    // We need special behaviour when we operate with TimeChunk
                    // As nextNode, select OutNode
                    nextNode = flowPath[nextNode].Nodes[flowPath[nextNode].Nodes.Count - 1 - timeChunkNodeCounter];
                    timeChunkNodeCounter++;
                }
                else
                {
                    // As nextNode, select either SelectedNode, or, if it is null, first element of Nodes list
                    nextNode = flowPath[nextNode].Nodes[0];
                }
                path.Add(nextNode);
            }
            timeChunkNodeCounter = 0;

            path.Reverse();
            return path;
        }

        private List<AssignmentPreview> GetResultFromGraph(int day)
        {
            Console.WriteLine("Starting GetResultFromGraph");

            var timeNodes = Nodes.Where(node => node.Value != -1);

            var usedTimeNodes = timeNodes.Where(node => node.InputEdges.Count != 0);

            Console.WriteLine("Time nodes total: " + usedTimeNodes.Count());

            //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
            var edges = usedTimeNodes.Where(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetResult") == 1).Count() == 1)
                                     .Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetREsult2") == 1).Single());

            Console.WriteLine("Time nodes with selected edge: " + edges.Count());

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

    /// <summary>
    /// This is used as value in NodesPath
    /// </summary>
    class NodesPathCollection
    {
        public List<Node> Nodes;
        public Node SelectedNode;

        public NodesPathCollection()
        {
            Nodes = new List<Node>();
            SelectedNode = null;
        }
    }
}

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

        /// <summary>
        /// Gets result using flows. This method will set student assigned times and return array of minutes, when is break time each day
        /// </summary>
        /// <returns></returns>
        public int[] GetResult()
        {
            int[] breaks = new int[5];

            for (int day = 0; day < 5; day++)
            {
                Console.WriteLine($"===================DEN: {day}==============");
                BuildGraph(day);
                Start();
                Console.WriteLine("Dobehlo to...");
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

            Console.WriteLine("Break: ");
            Console.WriteLine(String.Join(", ", breaks));

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
        private bool CreateNewFlow()
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
                List<Node> renderedPath = RenderPath(Nodes.First(), node, FlowPath);
                foreach (Edge outputEdge in node.OutputEdges)
                {
                    int flow = outputEdge.GetCurrentFlow(renderedPath, this);
                    if (flow > 1)
                        doInputEdges = false;
                    if (flow == 0)
                        avaiableNodes.Add(outputEdge.To);
                }
                if (doInputEdges)
                {
                    foreach (Edge inputEdge in node.InputEdges)
                    {
                        if (renderedPath.Count >= 2 && inputEdge.From == renderedPath[renderedPath.Count - 2])
                            continue;

                        int flow = inputEdge.GetCurrentFlow(renderedPath, this);
                        if (flow == 1)
                            avaiableNodes.Add(inputEdge.From);
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
            Console.WriteLine(this.ToString());
            DEBUG_WriteFlowPath(FlowPath);
            var TimeChunk = FlowPath.Keys.Where(x => x.Identifier == "TimeChunk").SingleOrDefault();
            if (TimeChunk == null || FlowPath[TimeChunk] == null)
            {
                Console.WriteLine("No flow");
                // No flow
                return false;
            }
            else
            {
                Console.WriteLine("Applying flow");
                ApplyFlow(Nodes.First(), TimeChunk, FlowPath);
                return true;
            }
        }

        private void DEBUG_WriteFlowPath(Dictionary<Node, Node> FlowPath)
        {
            string output = "Keys: " + String.Join(" | ", FlowPath.Keys.Select(x => x.Identifier));
            output += "\n";
            output += "Values: " + String.Join(" | ", FlowPath.Values.Select(x => x == null ? "---" : x.Identifier));
            Console.WriteLine(output);
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
            Console.Write("Startuje GetResultFromGraph");

            var timeNodes = Nodes.Where(node => node.Value != -1);

            var usedTimeNodes = timeNodes.Where(node => node.InputEdges.Count != 0);

            Console.Write(usedTimeNodes.Count());

            //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
            var edges = usedTimeNodes.Where(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Count() == 1)
                                     .Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());

            Console.WriteLine(edges.Count());

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
                    Console.WriteLine($"Setting edge flow from {edge.ResultEdge.From.Identifier} to {edge.ResultEdge.To.Identifier} to 0");
                }
                else
                {
                    edge.ResultEdge.SetCurrentFlow(1);
                    Console.WriteLine($"Setting edge flow from {edge.ResultEdge.From.Identifier} to {edge.ResultEdge.To.Identifier} to 1");
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
                    command += $"{outputEdge.From.Identifier} -->|{outputEdge.GetCurrentFlow(new Node[0], this)}| {outputEdge.To.Identifier}\r\n";
                }
            }


            return command;
        }
    }
}

using StudentScheduler.AppLogic;
using StudentScheduler.AppLogic.NetworkFlow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleStudentSchedulerTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Flow flow = new Flow(new User("Test Teacher", new bool[5] { true, false, false, false, false }, new int[] { 10 * 60, -1, -1, -1, -1 }, new int[] { 12 * 60, -1, -1, -1, -1 }),
                new List<User>()
                {
                    new User("Student 1", new bool[5] { true, false, false, false, false }, new int[] { 10 * 60, -1, -1, -1, -1 }, new int[] { 12 * 60, -1, -1, -1, -1 }),
                    new User("Student 2", new bool[5] { true, false, false, false, false }, new int[] { 10 * 60 + 10, -1, -1, -1, -1 }, new int[] { 12 * 60 - 10, -1, -1, -1, -1 }),
                });
            // Alter flow
            
            flow.DEBUG_ClearNodes();
            Node root = new Node("Input", -1, Node.NodeType.Input);
            Node sink = new Node("Output", -1, Node.NodeType.Output);
            // Create students 1 and 2
            Node s1 = new Node("Student:Student 1", -1, Node.NodeType.Default);
            Node s2 = new Node("Student:Student 2", -1, Node.NodeType.Default);
            // Create times (not overlapping)
            Node t1 = new Node("Time (100)", 100, Node.NodeType.Default);
            Node t2 = new Node("Time (110)", 110, Node.NodeType.Default);
            Node t3 = new Node("Time (700)", 700, Node.NodeType.Default);
            // Add time chunk
            Node tch = new Node("TimeChunk", -1, Node.NodeType.Default);
            // Add paths from root to students and from times to timechunk and from timechunk via [timechunk] to sink
            root.OutputEdges.Add(new Edge(1, 0, root, s1));
            root.OutputEdges.Add(new Edge(1, 0, root, s2));
            s1.InputEdges.Add(root.OutputEdges[0]);
            s2.InputEdges.Add(root.OutputEdges[1]);

            t1.OutputEdges.Add(new Edge(1, 0, t1, tch));
            t2.OutputEdges.Add(new Edge(1, 0, t2, tch));
            t3.OutputEdges.Add(new Edge(1, 0, t3, tch));
            tch.InputEdges.Add(t1.OutputEdges[0]);
            tch.InputEdges.Add(t2.OutputEdges[0]);
            tch.InputEdges.Add(t3.OutputEdges[0]);

            tch.OutputEdges.Add(new TimeChunk(tch, sink));
            sink.InputEdges.Add(tch.OutputEdges[0]);
            // Add paths from students to times
            s1.OutputEdges.Add(new Edge(1, 0, s1, t1));
            s2.OutputEdges.Add(new Edge(1, 0, s2, t2));
            s2.OutputEdges.Add(new Edge(1, 0, s2, t3));
            t1.InputEdges.Add(s1.OutputEdges[0]);
            t2.InputEdges.Add(s2.OutputEdges[0]);
            t3.InputEdges.Add(s2.OutputEdges[1]);
            
            // Apply new graph
            flow.Nodes.AddRange(new List<Node>() { root, s1, s2, t1, t2, t3, tch, sink });
            // End of alter flow
            int[] breaks = flow.GetResult();

            Console.WriteLine("Done");
            Console.ReadKey();
        }
    }
}

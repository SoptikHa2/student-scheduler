using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic.NetworkFlow
{
    public class TimeChunk : Edge
    {
        public TimeChunk(Node from, Node to) : base(0, 0, from, to) { }

        private int GetBlockingNodes(IEnumerable<Node> timeNodes, Flow flow)
        {
            HashSet<Node> blockingNodes = new HashSet<Node>();
            foreach(Node timeNode in timeNodes)
            {
                var anotherTimeNodes = flow.Nodes.Where(node => node.Value != -1 && node != timeNode && node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Count() == 1);
                var newBlockingNodes = anotherTimeNodes.Where(node => Math.Abs(timeNode.Value - node.Value) < Plan.lessonLength);
                newBlockingNodes.ForEach(node => blockingNodes.Add(node));
            }

            return blockingNodes.Count;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="currentPath"></param>
        /// <param name="flow"></param>
        /// <returns>Number of nodes that block current path</returns>
        public override int GetCurrentFlow(IEnumerable<Node> currentPath, Flow flow)
        {
            int blockingNodes = GetBlockingNodes(currentPath.Where(node => node.Value != -1), flow);
            Console.WriteLine("Checking timechunk, " + blockingNodes + " blocking nodes found");
            return blockingNodes;
        }

        public override void SetCurrentFlow(int newValue)
        {
            // Do nothing
        }
    }
}

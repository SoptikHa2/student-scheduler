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

        private int GetBlockingNodes(IEnumerable<Node> timeNodes, Node baseNode)
        {
            return timeNodes.Where(tNode => Math.Abs(tNode.Value - baseNode.Value) < 50).Count();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="currentPath"></param>
        /// <param name="flow"></param>
        /// <returns>Number of nodes that block current path</returns>
        public override int GetCurrentFlow(IEnumerable<Node> currentPath, Flow flow, string info)
        {
            if (info == "ThisToString")
                return int.MinValue;

            int blockingNodes = -1;
            try
            {
                // Time node, that I want to go through
                Node baseNode = currentPath.ToList()[currentPath.Count() - 1];
                var allTimeNodes = flow.Nodes.Where(node => node.Value != -1 && node != baseNode && node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetCurrentFlow") == 1).Count() == 1).ToList();
                allTimeNodes.Union(currentPath.Where(node => node.Value != -1 && node != baseNode));
                blockingNodes = GetBlockingNodes(allTimeNodes, baseNode);
            }catch(Exception ex)
            {
                Console.WriteLine("BlockingNodes Failed! Info: " + info);
                Console.WriteLine(ex);
                throw ex;
            }
            return blockingNodes;
        }

        public override void SetCurrentFlow(int newValue)
        {
            // Do nothing
        }
    }
}

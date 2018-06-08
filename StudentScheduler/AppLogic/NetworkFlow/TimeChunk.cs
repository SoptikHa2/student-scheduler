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
            int blockingNodes = timeNodes.Where(tNode => Math.Abs(tNode.Value - baseNode.Value) < 50).Count();

            if (blockingNodes == 0)
            {
                Log.Write("I just passed with this settings: " + String.Join(" , ", timeNodes.Select(node => node.Identifier + " with value " + node.Value)) + ". Base was " + baseNode.Identifier + " with value " + baseNode.Value, Log.Severity.Critical);
            }
            else
            {
                Log.Write("I didn't pass with this settings:" + String.Join(" , ", timeNodes.Select(node => node.Identifier + " with value " + node.Value)) + ". Base was " + baseNode.Identifier + " with value " + baseNode.Value, Log.Severity.Critical);
            }

            return blockingNodes;
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
                Node baseNode = currentPath.ToList()[currentPath.Count() - 2];
                Log.Write("GetCurrentFlow Path: " + String.Join(",", currentPath.Select(node => node.Value)), Log.Severity.Info);
                var allTimeNodes = flow.Nodes.Where(node => node.Value != -1 && node != baseNode && node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null, "GetCurrentFlow") == 1).Count() == 1).ToList();
                allTimeNodes.Union(currentPath.Where(node => node.Value != -1 && node != baseNode));
                Log.Write("Starting BlockingNodes...", Log.Severity.Info);
                blockingNodes = GetBlockingNodes(allTimeNodes, baseNode);
                Log.Write("Ending BlockingNodes...", Log.Severity.Info);
            }
            catch (Exception ex)
            {
                Log.Write("BlockingNodes Failed! Info: " + info, Log.Severity.Critical);
                Log.Write(ex, Log.Severity.Critical);
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

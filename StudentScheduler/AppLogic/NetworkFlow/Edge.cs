using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic.NetworkFlow
{
    public class Edge
    {
        public int Capacity;
        private int currentFlow;
        public Node From;
        public Node To;

        public Edge(int capacity, int currentFlow, Node from, Node to)
        {
            Capacity = capacity;
            this.currentFlow = currentFlow;
            From = from;
            To = to;
        }

        public virtual int GetCurrentFlow(IEnumerable<Node> currentPath, Flow flow, string info)
        {
            return currentFlow;
        }

        public virtual void SetCurrentFlow(int newValue)
        {
            currentFlow = newValue;
        }
    }
}

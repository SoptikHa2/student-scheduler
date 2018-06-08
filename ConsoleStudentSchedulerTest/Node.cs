using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic.NetworkFlow
{
    public class Node
    {
        public enum NodeType
        {
            Default,
            Input,
            Output
        }

        public string Identifier;
        public int Value;

        public List<Edge> InputEdges;
        public List<Edge> OutputEdges;

        public NodeType Type;

        public Node(string identifier, int value, NodeType type)
        {
            Identifier = identifier;
            Value = value;
            this.Type = type;
            this.InputEdges = new List<Edge>();
            this.OutputEdges = new List<Edge>();
        }

        public override string ToString()
        {
            return this.Identifier + " (" + Value + ")";
        } 
    }
}

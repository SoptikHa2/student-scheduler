using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler
{
    public static class Log
    {
        const int lengthCollapseStart = int.MaxValue;
        const int previewLength = 30;

        public enum Severity
        {
            Info,
            Warning,
            Critical
        }

        private static HTMLDivElement target;

        public static void InitializeWithDiv(HTMLDivElement targetDiv)
        {
            target = targetDiv;
        }

        private static int counter = 0;
        public static void Write(object o, Severity severity)
        {
            // Log object to javascript console
            Bridge.Script.Call("console.log", o);
            // Log object with severity to the div
            string text = o.ToString();

            string html = String.Empty;
            // If the text is very long, collapse it
            if(text.Length > lengthCollapseStart)
            {
                
                string preview = text.Substring(0, previewLength) + "...";
                html = "<button type='button' class='logExpandable' data-toggle='collapse' data-target='#collapse-log-" + counter + "'>" + "<p style='color: " + GetColorBasedOnSeverity(severity) + ";'>" + preview + "</p></div>";
                html += "<div class='collapse row' id='collapse-log-" + counter + "'><div class='card card-body'>" + text + "</div></div>";
                counter++;
            }
            else
            {
                html = "<p style='color: " + GetColorBasedOnSeverity(severity) + ";'>" + text + "<p>";
            }

            WriteToDebug(html);
        }

        private static void WriteToDebug(string html)
        {
            target.InnerHTML += html + "<hr />";
        }

        private static string GetColorBasedOnSeverity(Severity severity)
        {
            switch (severity)
            {
                case Severity.Info:
                    return "Black";
                case Severity.Warning:
                    return "Green";
                case Severity.Critical:
                    return "Red";
            }

            return "Black";
        }
    }
}

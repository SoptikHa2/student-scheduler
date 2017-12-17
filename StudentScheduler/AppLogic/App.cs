using Bridge;
using Bridge.Html5;
using Newtonsoft.Json;
using StudentScheduler.AppLogic;
using System;
using System.Linq;

namespace StudentScheduler
{
    public class App
    {
        private static Plan plan;
        private static bool lastSetWasTeacher;
        private static int lastSetId;

        public static void Main()
        {
            // TODO: load?
            plan = new Plan();

            // Register callbacks
            var butNewTeacher = Gid("add-teacher");
            butNewTeacher.OnClick += (e) => { AddNewTeacher(butNewTeacher); };
            var butNewStudent = Gid("add-student");
            butNewStudent.OnClick += (e) => { AddNewStudent(butNewStudent); };
        }

        private static void AddNewTeacher(HTMLElement sender)
        {
            // Get name input and it's value
            HTMLInputElement input = (sender.ParentElement.ParentElement.GetElementsByClassName("form-group")[0].Children.Where(x => x.Id == ("teacher-name")).First() as HTMLInputElement);
            string newTeacherName = input.Value;
            if (newTeacherName == "")
                return;

            plan.teachers.Add(new User(newTeacherName, new bool[5], new int[5], new int[5]));
            HTMLElement div = Gid("teachers");

            HTMLDivElement card = new HTMLDivElement();
            card.ClassName = "card card-body";
            card.InnerHTML += "<p><strong>" + newTeacherName + "</strong></p>";
            HTMLButtonElement setHours = new HTMLButtonElement();
            setHours.Name = (plan.teachers.Count - 1).ToString();
            setHours.ClassName = "btn btn-primary teacher-click";
            setHours.SetAttribute("data-toggle", "modal");
            setHours.SetAttribute("data-target", "#setHoursTeacherModal");
            setHours.InnerHTML = "Nastavit hodiny";
            card.AppendChild(setHours);
            div.AppendChild(card);

            input.Value = "";
        }

        private static void AddNewStudent(HTMLElement sender)
        {
            // Get name input and it's value
            HTMLInputElement input = (sender.ParentElement.ParentElement.GetElementsByClassName("form-group")[0].Children.Where(x => x.Id == ("student-name")).First() as HTMLInputElement);
            string newStudentName = input.Value;
            if (newStudentName == "")
                return;

            plan.students.Add(new User(newStudentName, new bool[5], new int[5], new int[5]));
            HTMLElement div = Gid("students");

            HTMLDivElement card = new HTMLDivElement();
            card.ClassName = "card card-body";
            card.InnerHTML += "<p><strong>" + newStudentName + "</strong></p>";
            HTMLButtonElement setHours = new HTMLButtonElement();
            setHours.Name = (plan.teachers.Count - 1).ToString();
            setHours.ClassName = "btn btn-primary teacher-click";
            setHours.SetAttribute("data-toggle", "modal");
            setHours.SetAttribute("data-target", "#setHoursStudentModal");
            setHours.InnerHTML = "Nastavit hodiny";
            card.AppendChild(setHours);
            div.AppendChild(card);

            input.Value = "";
        }

        private static void TeacherEditHoursClick(object sender)
        {

        }

        private static void StudentEditHoursClick(object sender)
        {

        }




        private static HTMLElement Gid(string id) => Document.GetElementById(id);
        private static HTMLElement[] Gcl(string cls) => Document.GetElementsByClassName(cls).ToArray();
    }
}
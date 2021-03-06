﻿using Bridge;
using Bridge.Html5;
using Newtonsoft.Json;
using StudentScheduler.AppLogic;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StudentScheduler
{
    public class App
    {
        private static Plan plan;
        private static bool lastSetWasTeacher;
        private static int lastSetId;
        private static int lastSelectedDay;
        private static int dayId;

        private static string[] days = { "monday", "tuesday", "wednesday", "thursday", "friday" };

        public static void Main()
        {
            // TODO: load?
            plan = new Plan();

            // Register callbacks
            var butNewTeacher = Gid("add-teacher");
            butNewTeacher.OnClick += (e) => { AddNewTeacher(butNewTeacher); };
            var butNewStudent = Gid("add-student");
            butNewStudent.OnClick += (e) => { AddNewStudent(butNewStudent); };

            var buts = Gcl("teacher-click");
            for (int i = 0; i < buts.Length; i++)
                buts[i].OnClick += (e) => { EditHoursClick(buts[i], true); };

            buts = Gcl("student-click");
            for (int i = 0; i < buts.Length; i++)
                buts[i].OnClick += (e) => { EditHoursClick(buts[i], false); };

            buts = Gcl("but-time-set");
            for (int i = 0; i < buts.Length; i++)
            {
                int c = i;
                buts[i].OnClick += (e) => { SomeDayEditHoursClick(buts[c]); };
            }
            Gid("set-time-hours").OnClick = (e) => { SaveHourChange(); UpdateListOfDays(); };

            Gid("set-time-hours-cancel").OnClick = (e) => { RemoveHourInDay(); UpdateListOfDays(); };

            Gid("run").OnClick = (e) => { plan.Calc(); Gid("output").InnerHTML = plan.GenerateHTML(); };

            // Test
            Gid("test").OnClick = (e) =>
            {
                plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, true, false, false }, new int[] { 12 * 60, 0, 14 * 60, 0, 0 }, new int[] { 20 * 60, 0, 19 * 60, 0, 0 }));

                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 15 * 60, 0, 0, 0, 0 }, new int[] { 16 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 11 * 60, 0, 0, 0, 0 }, new int[] {18 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 3", new bool[] { true, false, false, false, false }, new int[] { 12 * 60, 0, 0, 0, 0 }, new int[] { 14 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 4", new bool[] { true, false, false, false, false }, new int[] { 0, 0, 0, 0, 0 }, new int[] { 23 * 60 + 59, 0, 0, 0, 0 }));
                

                /*plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));

                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 10 * 60 + 10, 0, 0, 0, 0 }, new int[] { 11 * 60 + 50, 0, 0, 0, 0 }));
                */


                /*// Randomly generated input
                plan.teachers.Add(new User("Teacher", new bool[] { true, true, true, true, true }, new int[] { 10 * 60, 10 * 60, 10 * 60, 10 * 60, 10 * 60 }, new int[] { 18 * 60, 18 * 60, 18 * 60, 18 * 60, 18 * 60 }));
                // Generate 30 students
                Random rnd = new Random();
                for (int i = 0; i < 30; i++)
                {
                    int[] timesFrom = new int[] { rnd.Next(10 * 60, 15 * 60), rnd.Next(10 * 60, 15 * 60), rnd.Next(10 * 60, 15 * 60), rnd.Next(10 * 60, 15 * 60), rnd.Next(10 * 60, 15 * 60) };
                    int[] timesTo = new int[] { rnd.Next(12 * 60, 18 * 60), rnd.Next(12 * 60, 18 * 60), rnd.Next(12 * 60, 18 * 60), rnd.Next(12 * 60, 18 * 60), rnd.Next(12 * 60, 18 * 60) };
                    plan.students.Add(new User("Student " + i, new bool[] { true, true, true, true, true }, timesFrom, timesTo));
                }*/

                plan.Calc();
                Gid("output").InnerHTML = plan.GenerateHTML();
            };

            Log.InitializeWithDiv(Gid("logDiv") as HTMLDivElement);
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
            setHours.SetAttribute("data-target", "#setHoursModal");
            setHours.InnerHTML = "Nastavit hodiny";
            setHours.OnClick += (e) => { EditHoursClick(setHours, true); };
            card.AppendChild(setHours);
            div.AppendChild(card);

            input.Value = "";

            // Allow only one teacher
            Gid("add-new-teacher-modal-button").Remove();
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
            setHours.Name = (plan.students.Count - 1).ToString();
            setHours.ClassName = "btn btn-primary teacher-click";
            setHours.SetAttribute("data-toggle", "modal");
            setHours.SetAttribute("data-target", "#setHoursModal");
            setHours.InnerHTML = "Nastavit hodiny";
            setHours.OnClick += (e) => { EditHoursClick(setHours, false); };
            card.AppendChild(setHours);
            div.AppendChild(card);

            input.Value = "";
        }

        private static void EditHoursClick(object sender, bool wasTeacher)
        {
            lastSetWasTeacher = wasTeacher;
            lastSetId = int.Parse((sender as HTMLElement).GetAttribute("name"));
            List<User> selectedCollection = (wasTeacher ? plan.teachers : plan.students);

            Gid("set-time-monday").InnerHTML = selectedCollection[lastSetId].GetHoursInDay(0);
            Gid("set-time-tuesday").InnerHTML = selectedCollection[lastSetId].GetHoursInDay(1);
            Gid("set-time-wednesday").InnerHTML = selectedCollection[lastSetId].GetHoursInDay(2);
            Gid("set-time-thursday").InnerHTML = selectedCollection[lastSetId].GetHoursInDay(3);
            Gid("set-time-friday").InnerHTML = selectedCollection[lastSetId].GetHoursInDay(4);

            Gid("setTimeModalInfoText").InnerHTML = "V tento den má " + selectedCollection[lastSetId].name + " čas";

            UpdateListOfDays();
        }

        private static void SomeDayEditHoursClick(object sender)
        {
            dayId = int.Parse((sender as HTMLElement).GetAttribute("name"));

            var getTimeFromHH = Gid("get-time-from-hh") as HTMLInputElement;
            var getTimeFromMM = Gid("get-time-from-mm") as HTMLInputElement;
            var getTimeToHH = Gid("get-time-to-hh") as HTMLInputElement;
            var getTimeToMM = Gid("get-time-to-mm") as HTMLInputElement;

            var collection = lastSetWasTeacher ? plan.teachers : plan.students;

            var usr = collection[lastSetId];


            if (usr.minutesFromAvailable[dayId] > 0)
            {
                int hoursFrom = (int)Math.Floor(usr.minutesFromAvailable[dayId] / 60d);
                getTimeFromHH.Value = hoursFrom.ToString();
                getTimeFromMM.Value = (usr.minutesFromAvailable[dayId] - hoursFrom * 60).ToString();
            }
            else
            {
                getTimeFromHH.Value = "";
                getTimeFromMM.Value = "";
            }


            if (usr.minutesToAvailable[dayId] > 0)
            {
                int hoursTo = (int)Math.Floor(usr.minutesToAvailable[dayId] / 60d);
                getTimeToHH.Value = hoursTo.ToString();
                getTimeToMM.Value = (usr.minutesToAvailable[dayId] - hoursTo * 60d).ToString();
            }
            else
            {
                getTimeToHH.Value = "";
                getTimeToMM.Value = "";
            }
        }

        private static void SaveHourChange()
        {
            try
            {
                var collection = lastSetWasTeacher ? plan.teachers : plan.students;

                int from = (int)(int.Parse((Gid("get-time-from-hh") as HTMLInputElement).Value) * 60 + int.Parse((Gid("get-time-from-mm") as HTMLInputElement).Value));
                int to = (int)(int.Parse((Gid("get-time-to-hh") as HTMLInputElement).Value) * 60 + int.Parse((Gid("get-time-to-mm") as HTMLInputElement).Value));

                if (from + Plan.lessonLength > to)
                {
                    RemoveHourInDay();
                    return;
                }

                collection[lastSetId].minutesFromAvailable[dayId] = from;
                collection[lastSetId].minutesToAvailable[dayId] = to;
            }
            catch { }
        }

        private static void RemoveHourInDay()
        {
            var collection = lastSetWasTeacher ? plan.teachers : plan.students;

            collection[lastSetId].minutesFromAvailable[dayId] = 0;
            collection[lastSetId].minutesToAvailable[dayId] = 0;
        }

        private static void UpdateListOfDays()
        {
            var collection = lastSetWasTeacher ? plan.teachers : plan.students;

            // Set to all days: if there is at least {Plan.lessonLength} (50) minutes between two times: return times in format ["HH:MM - HH:MM"], else, return "Není nastaveno"
            for (int i = 0; i < 5; i++)
            {
                Gid("set-time-" + days[i]).InnerHTML = collection[lastSetId].minutesToAvailable[i] - collection[lastSetId].minutesFromAvailable[i] < Plan.lessonLength ? "Není nastaveno" :
                                               MinutesToHoursAndMinutes(collection[lastSetId].minutesFromAvailable[i]) + " - " + MinutesToHoursAndMinutes(collection[lastSetId].minutesToAvailable[i]);
            }
        }



        private static string MinutesToHoursAndMinutes(int minutes)
        {
            int hours = (int)Math.Floor(minutes / 60d);
            return hours.ToString("00") + ":" + (minutes - hours * 60).ToString("00");
        }

        private static string MyNumberToStringWithAtLeastTwoDigitsFormat(int number)
        {
            string num = number.ToString();
            if (num.Length == 1)
                num = "0" + num;
            return num;
        }

        private static HTMLElement Gid(string id) => Document.GetElementById(id);
        private static HTMLCollection Gcl(string cls) => Document.Body.GetElementsByClassName(cls);
    }
}
﻿using StudentScheduler.AppLogic;
using StudentScheduler.AppLogic.NetworkFlow;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WinFormsStudentScheduler.Forms
{
    public partial class MainWindow : Form
    {
        public MainWindow()
        {
            InitializeComponent();

            UsersListBox.Items.Add(new User("Učitel", new bool[5], new int[5], new int[5]));
        }

        private void NewUserButton_Click(object sender, EventArgs e)
        {
            var dialog = new EditUserDialog();

            if (dialog.ShowDialog() == DialogResult.OK)
            {
                UsersListBox.Items.Add(dialog.Result);
            }
        }

        private void EditUserButton_Click(object sender, EventArgs e)
        {
            if (UsersListBox.SelectedItem == null)
                return;

            var dialog = new EditUserDialog(UsersListBox.SelectedIndex != 0, UsersListBox.SelectedItem as User);

            DialogResult result = dialog.ShowDialog();
            if (result == DialogResult.OK)
            {
                UsersListBox.Items[UsersListBox.SelectedIndex] = dialog.Result;
            }
            else if (result == DialogResult.No) // Remove student
            {
                UsersListBox.Items.Remove(UsersListBox.SelectedItem);
            }
        }

        private void StartButton_Click(object sender, EventArgs e)
        {
            List<User> students = new List<User>();
            for (int i = 1; i < UsersListBox.Items.Count; i++)
            {
                students.Add(UsersListBox.Items[i] as User);
            }
            // Remove previous results from students
            students.ForEach(student => { student.assigned = false; student.assignedDay = -1; student.assignedMinutes = -1; });

            Flow f = new Flow(UsersListBox.Items[0] as User, students);

            int[] breaks = f.GetResult();
            DisplayResult(breaks, students);
        }

        private void DisplayResult(int[] breaks, IEnumerable<User> students)
        {
            students = students.OrderBy(student => student.assignedMinutes);

            RichTextBox target = ResultRichTextBox;
            target.Clear();

            Font headline = new Font("Segoe UI", 20);
            Font italic = new Font("Segoe UI", 12, FontStyle.Italic);
            Font regular = new Font("Segoe UI", 12);

            string[] days = "Pondělí Úterý Středa Čtvrtek Pátek".Split(' ');

            // Write all unpossed students
            var unpossedStudents = students.Where(student => !student.assigned);
            if (unpossedStudents.Count() > 0)
            {
                AddTextLine(target, "Následující studenty se nepodařilo umístit: " + String.Join(", ", unpossedStudents), regular);
            }

            for (int i = 0; i < 5; i++)
            {
                AddTextLine(target, days[i], headline);
                var studentsToday = students.Where(st => st.assignedDay == i);
                if (studentsToday.Count() == 0)
                {
                    AddTextLine(target, "Na dnešek není nic naplánovaného", italic);
                }
                else
                {
                    bool breakUsed = false;
                    foreach (User student in studentsToday)
                    {
                        int todayFrom = student.assignedMinutes;
                        if (!breakUsed && todayFrom > breaks[i])
                        {
                            AddTextLine(target, $"({ConvertMinutesToText(breaks[i])}-{ConvertMinutesToText(breaks[i] + 15)})  Přestávka", italic);
                            breakUsed = true;
                        }
                        AddTextLine(target, $"({ConvertMinutesToText(student.assignedMinutes)}-{ConvertMinutesToText(student.assignedMinutes + 50)}) {student.name}", regular);
                    }
                }
            }
        }

        private void AddTextLine(RichTextBox target, string text, Font font)
        {
            target.DeselectAll();
            target.SelectionFont = font;
            target.AppendText(text + "\n");
            target.DeselectAll();
        }

        private static string ConvertMinutesToText(int minutes) => $"{minutes / 60}:{(minutes - ((minutes / 60) * 60)).ToString("00")}";
    }
}

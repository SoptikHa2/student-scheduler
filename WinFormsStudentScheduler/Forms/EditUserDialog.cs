using StudentScheduler.AppLogic;
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
    public partial class EditUserDialog : Form
    {
        public User Result;

        public EditUserDialog(User user = null)
        {
            InitializeComponent();

            if (user != null)
            {
                Result = user;

                NameTextInput.Text = Result.name;
                InputPO.Text = user.daysAvailable[0] ? TimeForDay.GetTextInputFromTime(user.minutesFromAvailable[0], user.minutesToAvailable[0]) : "";
                InputUT.Text = user.daysAvailable[1] ? TimeForDay.GetTextInputFromTime(user.minutesFromAvailable[1], user.minutesToAvailable[1]) : "";
                InputST.Text = user.daysAvailable[2] ? TimeForDay.GetTextInputFromTime(user.minutesFromAvailable[2], user.minutesToAvailable[2]) : "";
                InputCT.Text = user.daysAvailable[3] ? TimeForDay.GetTextInputFromTime(user.minutesFromAvailable[3], user.minutesToAvailable[3]) : "";
                InputPA.Text = user.daysAvailable[4] ? TimeForDay.GetTextInputFromTime(user.minutesFromAvailable[4], user.minutesToAvailable[4]) : "";
            }
            else
                Result = new User("", null, null, null);
        }

        private void OKButton_Click(object sender, EventArgs e)
        {
            string error = "Pondělí";
            bool succ;
            TimeForDay[] days = new TimeForDay[5];
            try
            {
                days[0] = new TimeForDay(InputPO.Text);
                error = "Úterý";
                days[1] = new TimeForDay(InputUT.Text);
                error = "Středa";
                days[2] = new TimeForDay(InputST.Text);
                error = "Čtvrtek";
                days[3] = new TimeForDay(InputCT.Text);
                error = "Pátek";
                days[4] = new TimeForDay(InputPA.Text);

                succ = true;
            }
            catch
            {
                MessageBox.Show("Zadání dne " + error + " nemohlo být zpracováno. Zadejte vstup podle příkladu.");
                succ = false;
            }

            Result.daysAvailable = days.Select(d => !d.IsEmpty).ToArray();
            Result.minutesFromAvailable = days.Select(d => d.IsEmpty ? -1 : d.HoursFrom * 60 + d.MinutesFrom).ToArray();
            Result.minutesToAvailable = days.Select(d => d.IsEmpty ? -1 : d.HoursTo * 60 + d.MinutesTo).ToArray();
            Result.name = NameTextInput.Text.Replace(":", "");

            if (succ)
                DialogResult = DialogResult.OK;
            else
                DialogResult = DialogResult.None;
        }

        private void CancelButton_Click(object sender, EventArgs e)
        {
            DialogResult = DialogResult.Cancel;
        }
    }

    struct TimeForDay
    {
        public int HoursFrom, HoursTo, MinutesFrom, MinutesTo;
        public bool IsEmpty;

        public TimeForDay(string input)
        {
            if(input.Trim() == "")
            {
                HoursFrom = -1;
                HoursTo = -1;
                MinutesFrom = -1;
                MinutesTo = -1;
                IsEmpty = true;
                return;
            }

            string[] ft = input.Split('-');
            ft = ft.Select(x => x.Trim()).ToArray();
            var sp = ft.SelectMany(f => f.Split(':').Select(x => x.Trim()));
            var tms = sp.Select(s => int.Parse(s)).ToArray();
            if(tms[0] > 23 || tms[2] > 23 || tms[1] > 59 || tms[3] > 59)
            {
                throw new ArgumentOutOfRangeException();
            }

            HoursFrom = tms[0];
            MinutesFrom = tms[1];
            HoursTo = tms[2];
            MinutesTo = tms[3];

            IsEmpty = false;
        }

        public static string GetTextInputFromTime(int minutesFrom, int minutesTo) => $"{minutesFrom / 60}:{(minutesFrom - ((minutesFrom / 60) * 60)).ToString("00")} - {minutesTo / 60}:{(minutesTo - ((minutesTo / 60) * 60)).ToString("00")}";
    }
}

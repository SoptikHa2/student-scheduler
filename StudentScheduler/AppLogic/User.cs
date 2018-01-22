using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic
{
    public class User
    {
        public string name;
        public bool[] daysAvailable;
        public int[] minutesFromAvailable;
        public int[] minutesToAvailable;
        public int assignedMinutes = -1;
        public int assignedDay = -1;
        public bool assigned = false;

        public User(string name, bool[] daysAvailable, int[] minutesFromAvailable, int[] minutesToAvailable)
        {
            this.name = name;
            this.daysAvailable = daysAvailable;
            this.minutesFromAvailable = minutesFromAvailable;
            this.minutesToAvailable = minutesToAvailable;
        }

        public string GetHoursInDay(int dayIndex)
        {
            if (dayIndex < 0 || dayIndex >= 5)
                throw new ArgumentException("Parameter MUST BE in range [0; 5). Value: " + dayIndex, "dayIndex");

            if (!daysAvailable[dayIndex])
                return "Není nastaveno";

            int minutesF = minutesFromAvailable[dayIndex];
            int minutesT = minutesToAvailable[dayIndex];

            int hoursF = (int)Math.Floor(minutesF / 60d);
            int hoursT = (int)Math.Floor(minutesT / 60d);

            return $"Od {hoursF}:{(minutesF - hoursF * 60).ToString("00")} do {hoursT}:{(minutesT - hoursT * 60).ToString("00")}";
        }
    }
}

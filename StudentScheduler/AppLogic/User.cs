using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic
{
    class User
    {
        public const int hourLength = 45;

        public string name;
        public bool[] daysAvailable;
        public int[] minutesFromAvailable;
        public int[] minutesToAvailable;
        public bool[] availableMinutes;
        public int assignedConvertedMinutesFrom;

        public User(string name, bool[] daysAvailable, int[] minutesFromAvailable, int[] minutesToAvailable)
        {
            this.name = name;
            this.daysAvailable = daysAvailable;
            this.minutesFromAvailable = minutesFromAvailable;
            this.minutesToAvailable = minutesToAvailable;
            assignedConvertedMinutesFrom = 0;
            availableMinutes = new bool[60 * 24];

            // For all days
            for (int i = 0; i < 5; i++)
            {
                if (!daysAvailable[i])
                    continue;

                // Go for every 5 minutes
                int c = 0;
                for (int m = 0; m < 60 * 24; m += 5)
                {
                    int currentminute = i * 24 * 60;
                    if (minutesFromAvailable[i] <= currentminute &&
                        minutesToAvailable[i] >= currentminute + hourLength)
                        availableMinutes[c] = true;
                    c++;
                }
            }
        }
    }
}

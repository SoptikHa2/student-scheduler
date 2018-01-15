using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic
{
    class Plan
    {
        public const int lessonLength = 50; // 45 + 5 pause


        public List<User> students;
        public List<User> teachers;

        public Plan()
        {
            students = new List<User>();
            teachers = new List<User>();
        }

        // NOTE: I assume there is only one teacher
        public object Calc()
        {
            // HOW THIS WORKS:


            // 1.0) Set start time as teacher's start time of the day
            // 1.1) Find student who has starting time the same as teacher's start time. If yes, pos and repeat 1) 45 minutes later.
            //      If not, move by 5 minutes and try it again with all students. If hit teacher's end time, move to next day

            // OPTIMALIZATION: Check if both teacher and students have some minutes in common. If not, skip this day




            // If all students are positioned, end. If not, head to step 2

            // 2.0) I have some students without assigned hours. Pick student with least possible hours. Find all
            //      hours where I can pos this student in all days.
            // 2.1) Choose the position where the least unassigned students can go. After that, choose position where
            //      is student with most free time
            // 2.2) Swap those students
            // 2.3) Repeat. If already repeated N times, where N is number of unassigned students at the beggining of phase 2,
            //      end, show all positioned students and report failure



            return null;
        }
    }
}

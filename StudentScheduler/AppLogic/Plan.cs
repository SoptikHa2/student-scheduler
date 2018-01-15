using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic
{
    public class Plan
    {
        public const int lessonLength = 50; // 45 + 5 pause
        private const int breakAfterLessons = 3; // Break after 3 lessons
        private const int breakAfterLessonsLength = 45; // Let's just sleep a bit 

        public List<User> students;
        public List<User> teachers;

        public Plan()
        {
            students = new List<User>();
            teachers = new List<User>();
        }

        // NOTE: I assume there is only one teacher
        public void Calc()
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



            if (teachers.Count != 1 || students.Count == 0)
                return;

            // First stage
            TryToPosAllStudents();
        }

        private void TryToPosAllStudents()
        {
            // Assuming I have just one teacher
            User teacher = teachers[0];

            for (int day = 0; day < 5; day++)
            {
                // For all days, skip day if either all students or teacher are busy

                // Get all students that have at least 50mins time today and still don't have anything assigned
                var studentsForThisDay = students.Where(x => x.minutesToAvailable[day] - x.minutesFromAvailable[day] >= 50 && !x.assigned).ToArray();

                if (teacher.minutesToAvailable[day] - teacher.minutesFromAvailable[day] < 50 || // If the teacher don't have full 50 minutes of time
                   studentsForThisDay.Length == 0) // Or if there is no student with at least 50 mintues of time
                    continue;



                // Go for all the teacher's minutes today

                int hoursElapsed = 0;
                for (int minute = teacher.minutesFromAvailable[day]; minute <= teacher.minutesToAvailable[day]; minute += 5)
                {
                    if (hoursElapsed == breakAfterLessons)
                    {
                        // I assume there is no need to repeat the break multiple times in a single day
                        hoursElapsed = int.MinValue;

                        minute += breakAfterLessonsLength; // TODO: Should I substract 5?
                        continue;
                    }

                    var studentsInThisTerm = studentsForThisDay.Where(student => student.minutesFromAvailable[day] <= minute &&
                                                                      student.minutesToAvailable[day] >= teacher.minutesToAvailable[day]);

                    // Choose student with the least time left
                    User chosenStudent = studentsInThisTerm.OrderBy(student => student.minutesToAvailable[day] - minute).FirstOrDefault();

                    if (chosenStudent == null)
                        continue;

                    chosenStudent.assignedMinutes = minute;
                    chosenStudent.assignedDay = day;
                    chosenStudent.assigned = true;
                }
            }
        }
    }
}


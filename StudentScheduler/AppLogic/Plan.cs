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
        private const int breakAfterLessonsLength = 15; // Let's just sleep a bit 

        public List<User> students;
        public List<User> teachers;

        public Plan()
        {
            students = new List<User>();
            teachers = new List<User>();
        }

        public string GenerateHTML()
        {
            string s = "";

            var notPosStudents = students.Where(x => !x.assigned);
            var posStudents = students.Where(x => x.assigned);

            if (notPosStudents.Count() > 0)
            {
                s += $"<div class=\"alert alert-danger alert-dismissible fade show\"role=\"alert\"" +
                    $"<p>Nepodařilo se najít místo pro {notPosStudents.Count()} z {students.Count} žáků " +
                    $"({String.Join(", ", notPosStudents.Select(x => x.name).ToArray())})</p>" +
                    $"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                    $"<span aria-hidden=\"true\">×</span></button></div>";
            }

            string[] days = { "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek" };

            for (int day = 0; day < 5; day++)
            {
                s += $"<div class=\"row\"><div class=\"card card-body\"><h3>{days[day]}</h3>";
                // <div class="card card-body">Petr (10:00 - 10:50)</div>

                var pssday = posStudents.Where(x => x.assignedDay == day).ToArray();

                if (pssday.Length == 0)
                    s += "<i>Na tento den není nic naplánovaného</i>";

                for (int i = 0; i < pssday.Length; i++)
                {
                    User current = pssday[i];
                    int hoursFrom = (int)Math.Floor(current.assignedMinutes / 60d);
                    int hoursTo = (int)Math.Floor((current.assignedMinutes + lessonLength) / 60d);

                    string hFrom = hoursFrom.ToString("00") + ":" + (current.assignedMinutes - hoursFrom * 60).ToString("00");
                    string hTo = hoursTo.ToString("00") + ":" + (current.assignedMinutes + lessonLength - hoursTo * 60).ToString("00");

                    s += $"<div class=\"card card-body\">{current.name} (" +
                        $"{hFrom} - {hTo})</div>";
                }

                s += "</div></div>";
            }

            return s;
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

            // Reset previous calculations
            for (int i = 0; i < students.Count; i++)
            {
                students[i].assigned = false;
                students[i].assignedDay = -1;
                students[i].assignedMinutes = -1;
            }

            // First stage
            TryToPosAllStudentsVer2();
        }

        private void TryToPosAllStudentsVer2()
        {
            User teacher = teachers[0];

            for (int day = 0; day < 5; day++)
            {
                if (teacher.minutesToAvailable[day] - teacher.minutesFromAvailable[day] < lessonLength)
                    continue;

                var studentsToday = students.Where(x => !x.assigned && x.minutesToAvailable[day] - x.minutesFromAvailable[day] >= lessonLength)
                                            .OrderBy(x => x.minutesToAvailable[day] - x.minutesFromAvailable[day]).ToArray();

                int possedHours = 0;
                int minutePossed = -1;

                for (int i = 0; i < studentsToday.Length; i++)
                {
                    // TODO: Muze se stat, ze ten student s nejmin velnyho casu bude mermomoci vepredu a bude blokovat misto pro jinyho, i kdyz by se
                    // v pohode vesel jeste dozadu. Treba A ma min casu nez B. A: 12:30-15:00, B: 12:00-17:00, vysledek bude
                    // A: 12:30-13:20, B: 13:20-14:10 MISTO B :12:00 - 12:50, A: 12:50-13:40

                    for (int minute = studentsToday[i].minutesFromAvailable[day]; minute <= studentsToday[i].minutesToAvailable[day]; minute += 5)
                    {
                        // If break
                        if (minute >= minutePossed && minute <= minutePossed + breakAfterLessonsLength)
                            continue;

                        var studentsInThisTimeFrame = studentsToday.Where(x => x.assigned && x.assignedDay == day && x.assignedMinutes >= minute - lessonLength && x.assignedMinutes <= minute + lessonLength);

                        if (studentsInThisTimeFrame.Count() > 0)
                            continue;

                        studentsToday[i].assigned = true;
                        studentsToday[i].assignedDay = day;
                        studentsToday[i].assignedMinutes = minute;

                        possedHours++;
                        if(possedHours == breakAfterLessons)
                        {
                            possedHours = int.MinValue;
                            minutePossed = minute;
                        }
                        break;
                    }
                }
            }
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
                        hoursElapsed = int.MinValue;

                        minute += breakAfterLessonsLength;
                        continue;
                    }

                    var studentsInThisTerm = studentsForThisDay.Where(student => student.minutesFromAvailable[day] <= minute &&
                                                                      student.minutesToAvailable[day] >= minute + lessonLength)
                                                                      .OrderBy(x => x.minutesToAvailable[day] - x.minutesFromAvailable[day]).ToArray();

                    User chosenStudent = studentsInThisTerm.FirstOrDefault();

                    if (chosenStudent == null)
                        continue;

                    chosenStudent.assignedMinutes = minute;
                    chosenStudent.assignedDay = day;
                    chosenStudent.assigned = true;

                    minute += lessonLength - 5;

                    hoursElapsed++;
                }
            }
        }
    }
}


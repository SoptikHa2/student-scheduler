/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 16.6.1
 */
Bridge.assembly("StudentScheduler", function ($asm, globals) {
    "use strict";

    Bridge.define("StudentScheduler.App", {
        main: function Main () {
            // TODO: load?
            StudentScheduler.App.plan = new StudentScheduler.AppLogic.Plan();

            // Register callbacks
            var butNewTeacher = StudentScheduler.App.Gid("add-teacher");
            butNewTeacher.onclick = Bridge.fn.combine(butNewTeacher.onclick, function (e) {
                StudentScheduler.App.AddNewTeacher(butNewTeacher);
            });
            var butNewStudent = StudentScheduler.App.Gid("add-student");
            butNewStudent.onclick = Bridge.fn.combine(butNewStudent.onclick, function (e) {
                StudentScheduler.App.AddNewStudent(butNewStudent);
            });

            var buts = StudentScheduler.App.Gcl("teacher-click");
            for (var i = 0; i < buts.length; i = (i + 1) | 0) {
                buts[System.Array.index(i, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i, buts)].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[System.Array.index(i, buts)], true);
                });
            }

            buts = StudentScheduler.App.Gcl("student-click");
            for (var i1 = 0; i1 < buts.length; i1 = (i1 + 1) | 0) {
                buts[System.Array.index(i1, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i1, buts)].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[System.Array.index(i1, buts)], false);
                });
            }

            buts = StudentScheduler.App.Gcl("but-time-set");
            for (var i2 = 0; i2 < buts.length; i2 = (i2 + 1) | 0) {
                var c = { v : i2 };
                buts[System.Array.index(i2, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i2, buts)].onclick, (function ($me, c) {
                    return function (e) {
                        StudentScheduler.App.SomeDayEditHoursClick(buts[System.Array.index(c.v, buts)]);
                    };
                })(this, c));
            }
            StudentScheduler.App.Gid("set-time-hours").onclick = function (e) {
                StudentScheduler.App.SaveHourChange();
                StudentScheduler.App.UpdateListOfDays();
            };

            StudentScheduler.App.Gid("set-time-hours-cancel").onclick = function (e) {
                StudentScheduler.App.RemoveHourInDay();
                StudentScheduler.App.UpdateListOfDays();
            };

            StudentScheduler.App.Gid("run").onclick = function (e) {
                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };

            // Test
            StudentScheduler.App.Gid("test").onclick = function (e) {
                StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User("Test Teacher", System.Array.init([true, false, true, false, false], System.Boolean), System.Array.init([720, 0, 840, 0, 0], System.Int32), System.Array.init([1200, 0, 1140, 0, 0], System.Int32)));

                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 1", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([900, 0, 0, 0, 0], System.Int32), System.Array.init([960, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 2", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([660, 0, 0, 0, 0], System.Int32), System.Array.init([1080, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 3", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([720, 0, 0, 0, 0], System.Int32), System.Array.init([840, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 4", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([0, 0, 0, 0, 0], System.Int32), System.Array.init([1439, 0, 0, 0, 0], System.Int32)));


                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };
        },
        statics: {
            fields: {
                plan: null,
                lastSetWasTeacher: false,
                lastSetId: 0,
                lastSelectedDay: 0,
                dayId: 0,
                days: null
            },
            ctors: {
                init: function () {
                    this.days = System.Array.init([
                        "monday", 
                        "tuesday", 
                        "wednesday", 
                        "thursday", 
                        "friday"
                    ], System.String);
                }
            },
            methods: {
                AddNewTeacher: function (sender) {
                    // Get name input and it's value
                    var input = (Bridge.as(System.Linq.Enumerable.from(sender.parentElement.parentElement.getElementsByClassName("form-group")[0].children).where(function (x) {
                            return Bridge.referenceEquals(x.id, ("teacher-name"));
                        }).first(), HTMLInputElement));
                    var newTeacherName = input.value;
                    if (Bridge.referenceEquals(newTeacherName, "")) {
                        return;
                    }

                    StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User(newTeacherName, System.Array.init(5, false, System.Boolean), System.Array.init(5, 0, System.Int32), System.Array.init(5, 0, System.Int32)));
                    var div = StudentScheduler.App.Gid("teachers");

                    var card = document.createElement("div");
                    card.className = "card card-body";
                    card.innerHTML = (card.innerHTML || "") + (("<p><strong>" + (newTeacherName || "") + "</strong></p>") || "");
                    var setHours = document.createElement("button");
                    setHours.name = (((StudentScheduler.App.plan.teachers.Count - 1) | 0)).toString();
                    setHours.className = "btn btn-primary teacher-click";
                    setHours.setAttribute("data-toggle", "modal");
                    setHours.setAttribute("data-target", "#setHoursModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    setHours.onclick = Bridge.fn.combine(setHours.onclick, function (e) {
                        StudentScheduler.App.EditHoursClick(setHours, true);
                    });
                    card.appendChild(setHours);
                    div.appendChild(card);

                    input.value = "";

                    // Allow only one teacher
                    StudentScheduler.App.Gid("add-new-teacher-modal-button").remove();
                },
                AddNewStudent: function (sender) {
                    // Get name input and it's value
                    var input = (Bridge.as(System.Linq.Enumerable.from(sender.parentElement.parentElement.getElementsByClassName("form-group")[0].children).where(function (x) {
                            return Bridge.referenceEquals(x.id, ("student-name"));
                        }).first(), HTMLInputElement));
                    var newStudentName = input.value;
                    if (Bridge.referenceEquals(newStudentName, "")) {
                        return;
                    }

                    StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User(newStudentName, System.Array.init(5, false, System.Boolean), System.Array.init(5, 0, System.Int32), System.Array.init(5, 0, System.Int32)));
                    var div = StudentScheduler.App.Gid("students");

                    var card = document.createElement("div");
                    card.className = "card card-body";
                    card.innerHTML = (card.innerHTML || "") + (("<p><strong>" + (newStudentName || "") + "</strong></p>") || "");
                    var setHours = document.createElement("button");
                    setHours.name = (((StudentScheduler.App.plan.students.Count - 1) | 0)).toString();
                    setHours.className = "btn btn-primary teacher-click";
                    setHours.setAttribute("data-toggle", "modal");
                    setHours.setAttribute("data-target", "#setHoursModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    setHours.onclick = Bridge.fn.combine(setHours.onclick, function (e) {
                        StudentScheduler.App.EditHoursClick(setHours, false);
                    });
                    card.appendChild(setHours);
                    div.appendChild(card);

                    input.value = "";
                },
                EditHoursClick: function (sender, wasTeacher) {
                    StudentScheduler.App.lastSetWasTeacher = wasTeacher;
                    StudentScheduler.App.lastSetId = System.Int32.parse((Bridge.as(sender, HTMLElement)).getAttribute("name"));
                    var selectedCollection = (wasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students);

                    StudentScheduler.App.Gid("set-time-monday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(0);
                    StudentScheduler.App.Gid("set-time-tuesday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(1);
                    StudentScheduler.App.Gid("set-time-wednesday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(2);
                    StudentScheduler.App.Gid("set-time-thursday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(3);
                    StudentScheduler.App.Gid("set-time-friday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(4);

                    StudentScheduler.App.Gid("setTimeModalInfoText").innerHTML = "V tento den má " + (selectedCollection.getItem(StudentScheduler.App.lastSetId).name || "") + " čas";

                    StudentScheduler.App.UpdateListOfDays();
                },
                SomeDayEditHoursClick: function (sender) {
                    StudentScheduler.App.dayId = System.Int32.parse((Bridge.as(sender, HTMLElement)).getAttribute("name"));

                    var getTimeFromHH = Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement);
                    var getTimeFromMM = Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement);
                    var getTimeToHH = Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement);
                    var getTimeToMM = Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement);

                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    var usr = collection.getItem(StudentScheduler.App.lastSetId);


                    if (usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] > 0) {
                        var hoursFrom = Bridge.Int.clip32(Math.floor(usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] / 60.0));
                        getTimeFromHH.value = hoursFrom.toString();
                        getTimeFromMM.value = (((usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] - Bridge.Int.mul(hoursFrom, 60)) | 0)).toString();
                    } else {
                        getTimeFromHH.value = "";
                        getTimeFromMM.value = "";
                    }


                    if (usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] > 0) {
                        var hoursTo = Bridge.Int.clip32(Math.floor(usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] / 60.0));
                        getTimeToHH.value = hoursTo.toString();
                        getTimeToMM.value = System.Double.format((usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] - hoursTo * 60.0));
                    } else {
                        getTimeToHH.value = "";
                        getTimeToMM.value = "";
                    }
                },
                SaveHourChange: function () {
                    var $t, $t1;
                    try {
                        var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                        var from = ((Bridge.Int.mul(System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement)).value), 60) + System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement)).value)) | 0);
                        var to = ((Bridge.Int.mul(System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement)).value), 60) + System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement)).value)) | 0);

                        if (((from + StudentScheduler.AppLogic.Plan.lessonLength) | 0) > to) {
                            StudentScheduler.App.RemoveHourInDay();
                            return;
                        }

                        ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = from;
                        ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = to;
                    }
                    catch ($e1) {
                        $e1 = System.Exception.create($e1);
                    }
                },
                RemoveHourInDay: function () {
                    var $t, $t1;
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = 0;
                    ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = 0;
                },
                UpdateListOfDays: function () {
                    var $t, $t1, $t2, $t3;
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    // Set to all days: if there is at least {Plan.lessonLength} (50) minutes between two times: return times in format ["HH:MM - HH:MM"], else, return "Není nastaveno"
                    for (var i = 0; i < 5; i = (i + 1) | 0) {
                        StudentScheduler.App.Gid("set-time-" + (StudentScheduler.App.days[System.Array.index(i, StudentScheduler.App.days)] || "")).innerHTML = ((($t = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t)] - ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t1)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength ? "Není nastaveno" : (StudentScheduler.App.MinutesToHoursAndMinutes(($t2 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t2)]) || "") + " - " + (StudentScheduler.App.MinutesToHoursAndMinutes(($t3 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t3)]) || "");
                    }
                },
                MinutesToHoursAndMinutes: function (minutes) {
                    var hours = Bridge.Int.clip32(Math.floor(minutes / 60.0));
                    return (System.Int32.format(hours, "00") || "") + ":" + (System.Int32.format((((minutes - Bridge.Int.mul(hours, 60)) | 0)), "00") || "");
                },
                MyNumberToStringWithAtLeastTwoDigitsFormat: function (number) {
                    var num = number.toString();
                    if (num.length === 1) {
                        num = "0" + (num || "");
                    }
                    return num;
                },
                Gid: function (id) {
                    return document.getElementById(id);
                },
                Gcl: function (cls) {
                    return System.Linq.Enumerable.from(document.body.getElementsByClassName(cls)).toArray();
                }
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.Plan", {
        statics: {
            fields: {
                lessonLength: 0,
                breakAfterLessons: 0,
                breakAfterLessonsLength: 0
            },
            ctors: {
                init: function () {
                    this.lessonLength = 50;
                    this.breakAfterLessons = 3;
                    this.breakAfterLessonsLength = 15;
                }
            }
        },
        fields: {
            breakAfterLessonsStart: null,
            students: null,
            teachers: null
        },
        ctors: {
            init: function () {
                this.breakAfterLessonsStart = System.Array.init([2147483647, 2147483647, 2147483647, 2147483647, 2147483647], System.Int32);
            },
            ctor: function () {
                this.$initialize();
                this.students = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
                this.teachers = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
            }
        },
        methods: {
            GenerateHTML: function () {
                var s = "";

                var notPosStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned;
                    });
                var posStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return x.assigned;
                    });

                if (notPosStudents.count() > 0) {
                    s = (s || "") + (((System.String.format("<div class=\"alert alert-danger alert-dismissible fade show\"role=\"alert\"", null) || "") + (System.String.format("<p>Nepodařilo se najít místo pro {0} z {1} žáků ", Bridge.box(notPosStudents.count(), System.Int32), Bridge.box(this.students.Count, System.Int32)) || "") + (System.String.format("({0})</p>", [notPosStudents.select(function (x) {
                            return x.name;
                        }).toArray(System.String).join(", ")]) || "") + (System.String.format("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">", null) || "") + (System.String.format("<span aria-hidden=\"true\">×</span></button></div>", null) || "")) || "");
                }

                var days = System.Array.init([
                    "Pondělí", 
                    "Úterý", 
                    "Středa", 
                    "Čtvrtek", 
                    "Pátek"
                ], System.String);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    var possedStudentsToday = 0;

                    s = (s || "") + ((System.String.format("<div class=\"row\"><div class=\"card card-body\"><h3>{0}</h3>", [days[System.Array.index(day, days)]])) || "");
                    // <div class="card card-body">Petr (10:00 - 10:50)</div>

                    var pssday = posStudents.where(function (x) {
                        return x.assignedDay === day;
                    }).orderBy(function (x) {
                        return x.assignedMinutes;
                    }).toArray(StudentScheduler.AppLogic.User);

                    if (pssday.length === 0) {
                        s = (s || "") + "<i>Na tento den není nic naplánovaného</i>";
                    }

                    for (var i = 0; i < pssday.length; i = (i + 1) | 0) {
                        var current = pssday[System.Array.index(i, pssday)];

                        // Insert break
                        if (possedStudentsToday === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                            var breakFrom = Bridge.Int.clip32(Math.floor(this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] / 60.0));
                            var breakTo = Bridge.Int.clip32(Math.floor((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0)) / 60.0));

                            var BreakHFrom = (System.Int32.format(breakFrom, "00") || "") + ":" + (System.Int32.format((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] - Bridge.Int.mul(breakFrom, 60)) | 0)), "00") || "");
                            var BreakHTo = (System.Int32.format(breakTo, "00") || "") + ":" + (System.Int32.format((((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0) - Bridge.Int.mul(breakTo, 60)) | 0)), "00") || "");

                            s = (s || "") + ((System.String.format("<div class=\"card card-body\" style=\"display: inline;\"><span style=\"font-style: italic;\">Přestávka</span> ({0} - {1})</div>", BreakHFrom, BreakHTo)) || "");

                        }


                        var hoursFrom = Bridge.Int.clip32(Math.floor(current.assignedMinutes / 60.0));
                        var hoursTo = Bridge.Int.clip32(Math.floor((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0)) / 60.0));

                        var hFrom = (System.Int32.format(hoursFrom, "00") || "") + ":" + (System.Int32.format((((current.assignedMinutes - Bridge.Int.mul(hoursFrom, 60)) | 0)), "00") || "");
                        var hTo = (System.Int32.format(hoursTo, "00") || "") + ":" + (System.Int32.format((((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0) - Bridge.Int.mul(hoursTo, 60)) | 0)), "00") || "");

                        s = (s || "") + (((System.String.format("<div class=\"card card-body\">{0} (", [current.name]) || "") + (System.String.format("{0} - {1})</div>", hFrom, hTo) || "")) || "");

                        possedStudentsToday = (possedStudentsToday + 1) | 0;
                    }

                    s = (s || "") + "</div></div>";
                }

                return s;
            },
            Calc: function () {
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



                if (this.teachers.Count !== 1 || this.students.Count === 0) {
                    return;
                }

                // Reset previous calculations
                for (var i = 0; i < this.students.Count; i = (i + 1) | 0) {
                    this.students.getItem(i).assigned = false;
                    this.students.getItem(i).assignedDay = -1;
                    this.students.getItem(i).assignedMinutes = -1;
                }

                // First stage
                this.TryToPosAllStudentsVer2();
                // Second stage
                this.PosNotPossedStudents();
            },
            TryToPosAllStudentsVer2: function () {
                var $t, $t1, $t2;
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength) {
                        continue;
                    }

                    var studentsToday = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return !x.assigned && ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength;
                        }).orderBy(function (x) {
                        return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                    }).toArray(StudentScheduler.AppLogic.User);

                    var possedHours = 0;
                    var minuteBreak = -1;

                    for (var i = 0; i < studentsToday.length; i = (i + 1) | 0) {
                        // TODO: Muze se stat, ze ten student s nejmin velnyho casu bude mermomoci vepredu a bude blokovat misto pro jinyho, i kdyz by se
                        // v pohode vesel jeste dozadu. Treba A ma min casu nez B. A: 12:30-15:00, B: 12:00-17:00, vysledek bude
                        // A: 12:30-13:20, B: 13:20-14:10 MISTO B :12:00 - 12:50, A: 12:50-13:40

                        for (var minute = { v : ($t = studentsToday[System.Array.index(i, studentsToday)].minutesFromAvailable)[System.Array.index(day, $t)] }; minute.v <= ($t1 = studentsToday[System.Array.index(i, studentsToday)].minutesToAvailable)[System.Array.index(day, $t1)]; minute.v = (minute.v + 5) | 0) {
                            if (teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] > minute.v) {
                                minute.v = (teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] - 5) | 0;
                                continue;
                            }

                            if (teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] < minute.v) {
                                break;
                            }

                            // If break
                            if (minute.v >= minuteBreak && minute.v <= ((minuteBreak + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0)) {
                                continue;
                            }

                            var studentsInThisTimeFrame = System.Linq.Enumerable.from(studentsToday).where((function ($me, minute) {
                                    return function (x) {
                                        return x.assigned && x.assignedDay === day && x.assignedMinutes >= ((minute.v - StudentScheduler.AppLogic.Plan.lessonLength) | 0) && x.assignedMinutes <= ((minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                    };
                                })(this, minute));

                            if (studentsInThisTimeFrame.count() > 0) {
                                continue;
                            }

                            possedHours = (possedHours + 1) | 0;

                            studentsToday[System.Array.index(i, studentsToday)].assigned = true;
                            studentsToday[System.Array.index(i, studentsToday)].assignedDay = day;
                            studentsToday[System.Array.index(i, studentsToday)].assignedMinutes = minute.v;

                            if (possedHours === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                                possedHours = -2147483648;
                                System.Console.WriteLine(System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).select(function (x) {
                                    return x.name;
                                }).toArray(System.String).join(", "));
                                var minuteOfLastPossedStudentToday = (($t2 = System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).toArray(StudentScheduler.AppLogic.User))[System.Array.index(2, $t2)].assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0;
                                minuteBreak = minuteOfLastPossedStudentToday;
                                this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = minuteBreak;
                            }
                            break;
                        }
                    }
                }
            },
            PosNotPossedStudents: function () {
                var unpossedStudents = System.Linq.Enumerable.from(this.students).where(function (student) {
                        return !student.assigned;
                    }).toList(StudentScheduler.AppLogic.User);

                if (unpossedStudents.Count === 0) {
                    return;
                }

                var change = true;

                while (change) {
                    change = false;
                    // Pick one of unposed students with lowest number of possible hours
                    var lowestStudentIndex = -1;
                    var lowestStudentMinutes = 2147483647;
                    for (var i = 0; i < unpossedStudents.Count; i = (i + 1) | 0) {
                        var s = unpossedStudents.getItem(i);
                        var minutes = 0;
                        for (var day = 0; day < 5; day = (day + 1) | 0) {
                            minutes = (minutes + (((s.minutesToAvailable[System.Array.index(day, s.minutesToAvailable)] - s.minutesFromAvailable[System.Array.index(day, s.minutesFromAvailable)]) | 0))) | 0;
                        }
                        if (minutes < lowestStudentMinutes) {
                            lowestStudentIndex = i;
                            lowestStudentMinutes = minutes;
                        }
                    }
                    var selectStudent = unpossedStudents.getItem(lowestStudentIndex);


                }
            },
            TryToPosAllStudents: function () {
                // Assuming I have just one teacher
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    // For all days, skip day if either all students or teacher are busy

                    // Get all students that have at least 50mins time today and still don't have anything assigned
                    var studentsForThisDay = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= 50 && !x.assigned;
                        }).toArray(StudentScheduler.AppLogic.User);

                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < 50 || studentsForThisDay.length === 0) {
                        continue;
                    }



                    // Go for all the teacher's minutes today

                    var hoursElapsed = 0;
                    for (var minute = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] }; minute.v <= teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)]; minute.v = (minute.v + 5) | 0) {
                        if (hoursElapsed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                            hoursElapsed = -2147483648;

                            minute.v = (minute.v + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                            continue;
                        }

                        var studentsInThisTerm = System.Linq.Enumerable.from(studentsForThisDay).where((function ($me, minute) {
                                return function (student) {
                                    return student.minutesFromAvailable[System.Array.index(day, student.minutesFromAvailable)] <= minute.v && student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] >= ((minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                };
                            })(this, minute)).orderBy(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                        }).toArray(StudentScheduler.AppLogic.User);

                        var chosenStudent = System.Linq.Enumerable.from(studentsInThisTerm).firstOrDefault(null, null);

                        if (chosenStudent == null) {
                            continue;
                        }

                        chosenStudent.assignedMinutes = minute.v;
                        chosenStudent.assignedDay = day;
                        chosenStudent.assigned = true;

                        minute.v = (minute.v + (45)) | 0;

                        hoursElapsed = (hoursElapsed + 1) | 0;
                    }
                }
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.User", {
        fields: {
            name: null,
            daysAvailable: null,
            minutesFromAvailable: null,
            minutesToAvailable: null,
            assignedMinutes: 0,
            assignedDay: 0,
            assigned: false
        },
        ctors: {
            init: function () {
                this.assignedMinutes = -1;
                this.assignedDay = -1;
                this.assigned = false;
            },
            ctor: function (name, daysAvailable, minutesFromAvailable, minutesToAvailable) {
                this.$initialize();
                this.name = name;
                this.daysAvailable = daysAvailable;
                this.minutesFromAvailable = minutesFromAvailable;
                this.minutesToAvailable = minutesToAvailable;
            }
        },
        methods: {
            GetHoursInDay: function (dayIndex) {
                if (dayIndex < 0 || dayIndex >= 5) {
                    throw new System.ArgumentException("Parameter MUST BE in range [0; 5). Value: " + dayIndex, "dayIndex");
                }

                if (!this.daysAvailable[System.Array.index(dayIndex, this.daysAvailable)]) {
                    return "Není nastaveno";
                }

                var minutesF = this.minutesFromAvailable[System.Array.index(dayIndex, this.minutesFromAvailable)];
                var minutesT = this.minutesToAvailable[System.Array.index(dayIndex, this.minutesToAvailable)];

                var hoursF = Bridge.Int.clip32(Math.floor(minutesF / 60.0));
                var hoursT = Bridge.Int.clip32(Math.floor(minutesT / 60.0));

                return System.String.format("Od {0}:{1} do {2}:{3}", Bridge.box(hoursF, System.Int32), System.Int32.format((((minutesF - Bridge.Int.mul(hoursF, 60)) | 0)), "00"), Bridge.box(hoursT, System.Int32), System.Int32.format((((minutesT - Bridge.Int.mul(hoursT, 60)) | 0)), "00"));
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLHdCQUFLQSxHQUFMQSwyREFBS0EsR0FBTEEsZ0JBQW1CQSxVQUFDQTtvQkFBUUEsb0NBQWVBLHdCQUFLQSxHQUFMQTs7OztZQUUvQ0EsT0FBT0E7WUFDUEEsS0FBS0EsWUFBV0EsS0FBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsSUFBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUU3QkEsY0FBUUE7Z0JBQ1JBLHdCQUFLQSxJQUFMQSwyREFBS0EsSUFBTEEsZ0JBQW1CQTtxQ0FBQ0E7d0JBQVFBLDJDQUFzQkEsd0JBQUtBLEtBQUxBOzs7O1lBRXREQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7WUFHckVBLDJDQUFzQkEsVUFBQ0E7Z0JBRW5CQSx1Q0FBa0JBLElBQUlBLCtDQUFxQkEsc0VBQWdEQSxtQkFBWUEsUUFBWUEsMkJBQWlCQSxtQkFBWUEsU0FB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NTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBQbGFuIHBsYW47XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBsYXN0U2V0V2FzVGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNldElkO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2VsZWN0ZWREYXk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGRheUlkO1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmdbXSBkYXlzID0geyBcIm1vbmRheVwiLCBcInR1ZXNkYXlcIiwgXCJ3ZWRuZXNkYXlcIiwgXCJ0aHVyc2RheVwiLCBcImZyaWRheVwiIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXRzID0gR2NsKFwidGVhY2hlci1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIHRydWUpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcInN0dWRlbnQtY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCBmYWxzZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwiYnV0LXRpbWUtc2V0XCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBjID0gaTtcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBTb21lRGF5RWRpdEhvdXJzQ2xpY2soYnV0c1tjXSk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnNcIikuT25DbGljayA9IChlKSA9PiB7IFNhdmVIb3VyQ2hhbmdlKCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWhvdXJzLWNhbmNlbFwiKS5PbkNsaWNrID0gKGUpID0+IHsgUmVtb3ZlSG91ckluRGF5KCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInJ1blwiKS5PbkNsaWNrID0gKGUpID0+IHsgcGxhbi5DYWxjKCk7IEdpZChcIm91dHB1dFwiKS5Jbm5lckhUTUwgPSBwbGFuLkdlbmVyYXRlSFRNTCgpOyB9O1xyXG5cclxuICAgICAgICAgICAgLy8gVGVzdFxyXG4gICAgICAgICAgICBHaWQoXCJ0ZXN0XCIpLk9uQ2xpY2sgPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcGxhbi50ZWFjaGVycy5BZGQobmV3IFVzZXIoXCJUZXN0IFRlYWNoZXJcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCB0cnVlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTIgKiA2MCwgMCwgMTQgKiA2MCwgMCwgMCB9LCBuZXcgaW50W10geyAyMCAqIDYwLCAwLCAxOSAqIDYwLCAwLCAwIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihcIlN0dWRlbnQgMVwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTUgKiA2MCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxNiAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMSAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7MTggKiA2MCwgMCwgMCwgMCwgMCB9KSk7XHJcbiAgICAgICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihcIlN0dWRlbnQgM1wiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTIgKiA2MCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxNCAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCA0XCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDIzICogNjAgKyA1OSwgMCwgMCwgMCwgMCB9KSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uQ2FsYygpO1xyXG4gICAgICAgICAgICAgICAgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgZnJvbSA9IChpbnQpKGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaW50IHRvID0gKGludCkoaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbSArIFBsYW4ubGVzc29uTGVuZ3RoID4gdG8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSB0bztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgUmVtb3ZlSG91ckluRGF5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFVwZGF0ZUxpc3RPZkRheXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRvIGFsbCBkYXlzOiBpZiB0aGVyZSBpcyBhdCBsZWFzdCB7UGxhbi5sZXNzb25MZW5ndGh9ICg1MCkgbWludXRlcyBiZXR3ZWVuIHR3byB0aW1lczogcmV0dXJuIHRpbWVzIGluIGZvcm1hdCBbXCJISDpNTSAtIEhIOk1NXCJdLCBlbHNlLCByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIlxyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtXCIgKyBkYXlzW2ldKS5Jbm5lckhUTUwgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldIC0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDwgUGxhbi5sZXNzb25MZW5ndGggPyBcIk5lbsOtIG5hc3RhdmVub1wiIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldKSArIFwiIC0gXCIgKyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhpbnQgbWludXRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBob3VycyA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChtaW51dGVzIC0gaG91cnMgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXQoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBudW0gPSBudW1iZXIuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgaWYgKG51bS5MZW5ndGggPT0gMSlcclxuICAgICAgICAgICAgICAgIG51bSA9IFwiMFwiICsgbnVtO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnQgR2lkKHN0cmluZyBpZCkge3JldHVybiBEb2N1bWVudC5HZXRFbGVtZW50QnlJZChpZCk7fVxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50W10gR2NsKHN0cmluZyBjbHMpIHtyZXR1cm4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0FycmF5PGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihEb2N1bWVudC5Cb2R5LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xzKSk7fVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBsYW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGxlc3Nvbkxlbmd0aCA9IDUwOyAvLyA0NSArIDUgcGF1c2VcclxuICAgICAgICBwcml2YXRlIGNvbnN0IGludCBicmVha0FmdGVyTGVzc29ucyA9IDM7IC8vIEJyZWFrIGFmdGVyIDMgbGVzc29uc1xyXG4gICAgICAgIHByaXZhdGUgY29uc3QgaW50IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoID0gMTU7IC8vIExldCdzIGp1c3Qgc2xlZXAgYSBiaXQgXHJcbiAgICAgICAgcHJpdmF0ZSBpbnRbXSBicmVha0FmdGVyTGVzc29uc1N0YXJ0ID0gbmV3IGludFtdIHsgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSwgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUgfTtcclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZW5lcmF0ZUhUTUwoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHMgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5vdFBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkKSk7XHJcbiAgICAgICAgICAgIHZhciBwb3NTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm90UG9zU3R1ZGVudHMuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWRhbmdlciBhbGVydC1kaXNtaXNzaWJsZSBmYWRlIHNob3dcXFwicm9sZT1cXFwiYWxlcnRcXFwiXCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHA+TmVwb2RhxZlpbG8gc2UgbmFqw610IG3DrXN0byBwcm8gezB9IHogezF9IMW+w6Frxa8gXCIsbm90UG9zU3R1ZGVudHMuQ291bnQoKSxzdHVkZW50cy5Db3VudCkrXHJcbnN0cmluZy5Gb3JtYXQoXCIoezB9KTwvcD5cIixTdHJpbmcuSm9pbihcIiwgXCIsIG5vdFBvc1N0dWRlbnRzLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSkpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJhbGVydFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlwiKStcclxuc3RyaW5nLkZvcm1hdChcIjxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj7Dlzwvc3Bhbj48L2J1dHRvbj48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0cmluZ1tdIGRheXMgPSB7IFwiUG9uZMSbbMOtXCIsIFwiw5p0ZXLDvVwiLCBcIlN0xZllZGFcIiwgXCLEjHR2cnRla1wiLCBcIlDDoXRla1wiIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHBvc3NlZFN0dWRlbnRzVG9kYXkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcInJvd1xcXCI+PGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPjxoMz57MH08L2gzPlwiLGRheXNbZGF5XSk7XHJcbiAgICAgICAgICAgICAgICAvLyA8ZGl2IGNsYXNzPVwiY2FyZCBjYXJkLWJvZHlcIj5QZXRyICgxMDowMCAtIDEwOjUwKTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwc3NkYXkgPSBwb3NTdHVkZW50cy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZERheSA9PSBkYXkpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5hc3NpZ25lZE1pbnV0ZXMpKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBzc2RheS5MZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgICAgICBzICs9IFwiPGk+TmEgdGVudG8gZGVuIG5lbsOtIG5pYyBuYXBsw6Fub3ZhbsOpaG88L2k+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBwc3NkYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjdXJyZW50ID0gcHNzZGF5W2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkU3R1ZGVudHNUb2RheSA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBicmVha0Zyb20gPSAoaW50KU1hdGguRmxvb3IoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50IGJyZWFrVG8gPSAoaW50KU1hdGguRmxvb3IoKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSArIGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoKSAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgQnJlYWtIRnJvbSA9IGJyZWFrRnJvbS5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldIC0gYnJlYWtGcm9tICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyBCcmVha0hUbyA9IGJyZWFrVG8uVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSArIGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoIC0gYnJlYWtUbyAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiIHN0eWxlPVxcXCJkaXNwbGF5OiBpbmxpbmU7XFxcIj48c3BhbiBzdHlsZT1cXFwiZm9udC1zdHlsZTogaXRhbGljO1xcXCI+UMWZZXN0w6F2a2E8L3NwYW4+ICh7MH0gLSB7MX0pPC9kaXY+XCIsQnJlYWtIRnJvbSxCcmVha0hUbyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3Vyc0Zyb20gPSAoaW50KU1hdGguRmxvb3IoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBob3Vyc1RvID0gKGludClNYXRoLkZsb29yKChjdXJyZW50LmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aCkgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaEZyb20gPSBob3Vyc0Zyb20uVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nIGhUbyA9IGhvdXJzVG8uVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzICsgbGVzc29uTGVuZ3RoIC0gaG91cnNUbyAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzICs9IHN0cmluZy5Gb3JtYXQoXCI8ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCI+ezB9IChcIixjdXJyZW50Lm5hbWUpK1xyXG5zdHJpbmcuRm9ybWF0KFwiezB9IC0gezF9KTwvZGl2PlwiLGhGcm9tLGhUbyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NlZFN0dWRlbnRzVG9kYXkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzICs9IFwiPC9kaXY+PC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTk9URTogSSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgdGVhY2hlclxyXG4gICAgICAgIHB1YmxpYyB2b2lkIENhbGMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSE9XIFRISVMgV09SS1M6XHJcblxyXG5cclxuICAgICAgICAgICAgLy8gMS4wKSBTZXQgc3RhcnQgdGltZSBhcyB0ZWFjaGVyJ3Mgc3RhcnQgdGltZSBvZiB0aGUgZGF5XHJcbiAgICAgICAgICAgIC8vIDEuMSkgRmluZCBzdHVkZW50IHdobyBoYXMgc3RhcnRpbmcgdGltZSB0aGUgc2FtZSBhcyB0ZWFjaGVyJ3Mgc3RhcnQgdGltZS4gSWYgeWVzLCBwb3MgYW5kIHJlcGVhdCAxKSA0NSBtaW51dGVzIGxhdGVyLlxyXG4gICAgICAgICAgICAvLyAgICAgIElmIG5vdCwgbW92ZSBieSA1IG1pbnV0ZXMgYW5kIHRyeSBpdCBhZ2FpbiB3aXRoIGFsbCBzdHVkZW50cy4gSWYgaGl0IHRlYWNoZXIncyBlbmQgdGltZSwgbW92ZSB0byBuZXh0IGRheVxyXG5cclxuICAgICAgICAgICAgLy8gT1BUSU1BTElaQVRJT046IENoZWNrIGlmIGJvdGggdGVhY2hlciBhbmQgc3R1ZGVudHMgaGF2ZSBzb21lIG1pbnV0ZXMgaW4gY29tbW9uLiBJZiBub3QsIHNraXAgdGhpcyBkYXlcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGFsbCBzdHVkZW50cyBhcmUgcG9zaXRpb25lZCwgZW5kLiBJZiBub3QsIGhlYWQgdG8gc3RlcCAyXHJcblxyXG4gICAgICAgICAgICAvLyAyLjApIEkgaGF2ZSBzb21lIHN0dWRlbnRzIHdpdGhvdXQgYXNzaWduZWQgaG91cnMuIFBpY2sgc3R1ZGVudCB3aXRoIGxlYXN0IHBvc3NpYmxlIGhvdXJzLiBGaW5kIGFsbFxyXG4gICAgICAgICAgICAvLyAgICAgIGhvdXJzIHdoZXJlIEkgY2FuIHBvcyB0aGlzIHN0dWRlbnQgaW4gYWxsIGRheXMuXHJcbiAgICAgICAgICAgIC8vIDIuMSkgQ2hvb3NlIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgbGVhc3QgdW5hc3NpZ25lZCBzdHVkZW50cyBjYW4gZ28uIEFmdGVyIHRoYXQsIGNob29zZSBwb3NpdGlvbiB3aGVyZVxyXG4gICAgICAgICAgICAvLyAgICAgIGlzIHN0dWRlbnQgd2l0aCBtb3N0IGZyZWUgdGltZVxyXG4gICAgICAgICAgICAvLyAyLjIpIFN3YXAgdGhvc2Ugc3R1ZGVudHNcclxuICAgICAgICAgICAgLy8gMi4zKSBSZXBlYXQuIElmIGFscmVhZHkgcmVwZWF0ZWQgTiB0aW1lcywgd2hlcmUgTiBpcyBudW1iZXIgb2YgdW5hc3NpZ25lZCBzdHVkZW50cyBhdCB0aGUgYmVnZ2luaW5nIG9mIHBoYXNlIDIsXHJcbiAgICAgICAgICAgIC8vICAgICAgZW5kLCBzaG93IGFsbCBwb3NpdGlvbmVkIHN0dWRlbnRzIGFuZCByZXBvcnQgZmFpbHVyZVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodGVhY2hlcnMuQ291bnQgIT0gMSB8fCBzdHVkZW50cy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgcHJldmlvdXMgY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3R1ZGVudHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRmlyc3Qgc3RhZ2VcclxuICAgICAgICAgICAgVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKTtcclxuICAgICAgICAgICAgLy8gU2Vjb25kIHN0YWdlXHJcbiAgICAgICAgICAgIFBvc05vdFBvc3NlZFN0dWRlbnRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPCBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzVG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgcG9zc2VkSG91cnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgaW50IG1pbnV0ZUJyZWFrID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50c1RvZGF5Lkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IE11emUgc2Ugc3RhdCwgemUgdGVuIHN0dWRlbnQgcyBuZWptaW4gdmVsbnlobyBjYXN1IGJ1ZGUgbWVybW9tb2NpIHZlcHJlZHUgYSBidWRlIGJsb2tvdmF0IG1pc3RvIHBybyBqaW55aG8sIGkga2R5eiBieSBzZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHYgcG9ob2RlIHZlc2VsIGplc3RlIGRvemFkdS4gVHJlYmEgQSBtYSBtaW4gY2FzdSBuZXogQi4gQTogMTI6MzAtMTU6MDAsIEI6IDEyOjAwLTE3OjAwLCB2eXNsZWRlayBidWRlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQTogMTI6MzAtMTM6MjAsIEI6IDEzOjIwLTE0OjEwIE1JU1RPIEIgOjEyOjAwIC0gMTI6NTAsIEE6IDEyOjUwLTEzOjQwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZSA+PSBtaW51dGVCcmVhayAmJiBtaW51dGUgPD0gbWludXRlQnJlYWsgKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzSW5UaGlzVGltZUZyYW1lID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCAmJiB4LmFzc2lnbmVkRGF5ID09IGRheSAmJiB4LmFzc2lnbmVkTWludXRlcyA+PSBtaW51dGUgLSBsZXNzb25MZW5ndGggJiYgeC5hc3NpZ25lZE1pbnV0ZXMgPD0gbWludXRlICsgbGVzc29uTGVuZ3RoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkSG91cnMgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzID0gaW50Lk1pblZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoU3RyaW5nLkpvaW4oXCIsIFwiLCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHguYXNzaWduZWRNaW51dGVzKSkuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkuVG9BcnJheSgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnQgbWludXRlT2ZMYXN0UG9zc2VkU3R1ZGVudFRvZGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4LmFzc2lnbmVkTWludXRlcykpLlRvQXJyYXkoKVsyXS5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVCcmVhayA9IG1pbnV0ZU9mTGFzdFBvc3NlZFN0dWRlbnRUb2RheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSA9IG1pbnV0ZUJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFBvc05vdFBvc3NlZFN0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciB1bnBvc3NlZFN0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+ICFzdHVkZW50LmFzc2lnbmVkKSkuVG9MaXN0KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodW5wb3NzZWRTdHVkZW50cy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgYm9vbCBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGNoYW5nZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyBQaWNrIG9uZSBvZiB1bnBvc2VkIHN0dWRlbnRzIHdpdGggbG93ZXN0IG51bWJlciBvZiBwb3NzaWJsZSBob3Vyc1xyXG4gICAgICAgICAgICAgICAgaW50IGxvd2VzdFN0dWRlbnRJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgaW50IGxvd2VzdFN0dWRlbnRNaW51dGVzID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCB1bnBvc3NlZFN0dWRlbnRzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBzID0gdW5wb3NzZWRTdHVkZW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgbWludXRlcyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVzICs9IHMubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSBzLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtaW51dGVzIDwgbG93ZXN0U3R1ZGVudE1pbnV0ZXMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3RTdHVkZW50SW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb3dlc3RTdHVkZW50TWludXRlcyA9IG1pbnV0ZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgVXNlciBzZWxlY3RTdHVkZW50ID0gdW5wb3NzZWRTdHVkZW50c1tsb3dlc3RTdHVkZW50SW5kZXhdO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBGb3IgYWxsIGRheXMsIHNraXAgZGF5IGlmIGVpdGhlciBhbGwgc3R1ZGVudHMgb3IgdGVhY2hlciBhcmUgYnVzeVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdldCBhbGwgc3R1ZGVudHMgdGhhdCBoYXZlIGF0IGxlYXN0IDUwbWlucyB0aW1lIHRvZGF5IGFuZCBzdGlsbCBkb24ndCBoYXZlIGFueXRoaW5nIGFzc2lnbmVkXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNGb3JUaGlzRGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gNTAgJiYgIXguYXNzaWduZWQpKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPCA1MCB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBhbGwgdGhlIHRlYWNoZXIncyBtaW51dGVzIHRvZGF5XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07IG1pbnV0ZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldOyBtaW51dGUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNFbGFwc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG91cnNFbGFwc2VkID0gaW50Lk1pblZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1Rlcm0gPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0ZvclRoaXNEYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gbWludXRlICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjaG9zZW5TdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNJblRoaXNUZXJtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNob3NlblN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gbWludXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBsZXNzb25MZW5ndGggLSA1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFVzZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RyaW5nIG5hbWU7XHJcbiAgICAgICAgcHVibGljIGJvb2xbXSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWRNaW51dGVzID0gLTE7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZERheSA9IC0xO1xyXG4gICAgICAgIHB1YmxpYyBib29sIGFzc2lnbmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHB1YmxpYyBVc2VyKHN0cmluZyBuYW1lLCBib29sW10gZGF5c0F2YWlsYWJsZSwgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGUsIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGF5c0F2YWlsYWJsZSA9IGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb21BdmFpbGFibGUgPSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzVG9BdmFpbGFibGUgPSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldEhvdXJzSW5EYXkoaW50IGRheUluZGV4KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRheUluZGV4IDwgMCB8fCBkYXlJbmRleCA+PSA1KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXhjZXB0aW9uKFwiUGFyYW1ldGVyIE1VU1QgQkUgaW4gcmFuZ2UgWzA7IDUpLiBWYWx1ZTogXCIgKyBkYXlJbmRleCwgXCJkYXlJbmRleFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF5c0F2YWlsYWJsZVtkYXlJbmRleF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIjtcclxuXHJcbiAgICAgICAgICAgIGludCBtaW51dGVzRiA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUluZGV4XTtcclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNUID0gbWludXRlc1RvQXZhaWxhYmxlW2RheUluZGV4XTtcclxuXHJcbiAgICAgICAgICAgIGludCBob3Vyc0YgPSAoaW50KU1hdGguRmxvb3IobWludXRlc0YgLyA2MGQpO1xyXG4gICAgICAgICAgICBpbnQgaG91cnNUID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNUIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiT2QgezB9OnsxfSBkbyB7Mn06ezN9XCIsaG91cnNGLChtaW51dGVzRiAtIGhvdXJzRiAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpLGhvdXJzVCwobWludXRlc1QgLSBob3Vyc1QgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdCn0K

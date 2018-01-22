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
            students: null,
            teachers: null
        },
        ctors: {
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
                    s = (s || "") + ((System.String.format("<div class=\"row\"><div class=\"card card-body\"><h3>{0}</h3>", [days[System.Array.index(day, days)]])) || "");
                    // <div class="card card-body">Petr (10:00 - 10:50)</div>

                    var pssday = posStudents.where(function (x) {
                        return x.assignedDay === day;
                    }).toArray(StudentScheduler.AppLogic.User);

                    if (pssday.length === 0) {
                        s = (s || "") + "<i>Na tento den není nic naplánovaného</i>";
                    }

                    for (var i = 0; i < pssday.length; i = (i + 1) | 0) {
                        var current = pssday[System.Array.index(i, pssday)];
                        var hoursFrom = Bridge.Int.clip32(Math.floor(current.assignedMinutes / 60.0));
                        var hoursTo = Bridge.Int.clip32(Math.floor((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0)) / 60.0));

                        var hFrom = (System.Int32.format(hoursFrom, "00") || "") + ":" + (System.Int32.format((((current.assignedMinutes - Bridge.Int.mul(hoursFrom, 60)) | 0)), "00") || "");
                        var hTo = (System.Int32.format(hoursTo, "00") || "") + ":" + (System.Int32.format((((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0) - Bridge.Int.mul(hoursTo, 60)) | 0)), "00") || "");

                        s = (s || "") + (((System.String.format("<div class=\"card card-body\">{0} (", [current.name]) || "") + (System.String.format("{0} - {1})</div>", hFrom, hTo) || "")) || "");
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
            },
            TryToPosAllStudentsVer2: function () {
                var $t, $t1;
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
                    var minutePossed = -1;

                    for (var i = 0; i < studentsToday.length; i = (i + 1) | 0) {
                        // TODO: Muze se stat, ze ten student s nejmin velnyho casu bude mermomoci vepredu a bude blokovat misto pro jinyho, i kdyz by se
                        // v pohode vesel jeste dozadu. Treba A ma min casu nez B. A: 12:30-15:00, B: 12:00-17:00, vysledek bude
                        // A: 12:30-13:20, B: 13:20-14:10 MISTO B :12:00 - 12:50, A: 12:50-13:40

                        for (var minute = { v : ($t = studentsToday[System.Array.index(i, studentsToday)].minutesFromAvailable)[System.Array.index(day, $t)] }; minute.v <= ($t1 = studentsToday[System.Array.index(i, studentsToday)].minutesToAvailable)[System.Array.index(day, $t1)]; minute.v = (minute.v + 5) | 0) {
                            // If break
                            if (minute.v >= minutePossed && minute.v <= ((minutePossed + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0)) {
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

                            studentsToday[System.Array.index(i, studentsToday)].assigned = true;
                            studentsToday[System.Array.index(i, studentsToday)].assignedDay = day;
                            studentsToday[System.Array.index(i, studentsToday)].assignedMinutes = minute.v;

                            possedHours = (possedHours + 1) | 0;
                            if (possedHours === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                                possedHours = -2147483648;
                                minutePossed = minute.v;
                            }
                            break;
                        }
                    }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLHdCQUFLQSxHQUFMQSwyREFBS0EsR0FBTEEsZ0JBQW1CQSxVQUFDQTtvQkFBUUEsb0NBQWVBLHdCQUFLQSxHQUFMQTs7OztZQUUvQ0EsT0FBT0E7WUFDUEEsS0FBS0EsWUFBV0EsS0FBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsSUFBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUU3QkEsY0FBUUE7Z0JBQ1JBLHdCQUFLQSxJQUFMQSwyREFBS0EsSUFBTEEsZ0JBQW1CQTtxQ0FBQ0E7d0JBQVFBLDJDQUFzQkEsd0JBQUtBLEtBQUxBOzs7O1lBRXREQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5Q0FHdkNBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29C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QVlBO2dCQUNaQSxxQkFBcUJBO2dCQUNyQkEsNEJBQTRCQTtnQkFDNUJBLDBCQUEwQkE7Ozs7cUNBR0ZBO2dCQUV4QkEsSUFBSUEsZ0JBQWdCQTtvQkFDaEJBLE1BQU1BLElBQUlBLHlCQUFrQkEsK0NBQStDQTs7O2dCQUUvRUEsSUFBSUEsQ0FBQ0Esc0NBQWNBLFVBQWRBO29CQUNEQTs7O2dCQUVKQSxlQUFlQSw2Q0FBcUJBLFVBQXJCQTtnQkFDZkEsZUFBZUEsMkNBQW1CQSxVQUFuQkE7O2dCQUVmQSxhQUFhQSxrQkFBS0EsV0FBV0E7Z0JBQzdCQSxhQUFhQSxrQkFBS0EsV0FBV0E7O2dCQUU3QkEsT0FBT0EsOENBQXNDQSxrQ0FBT0EscUJBQUNBLGFBQVdBLDBDQUE0QkEsa0NBQU9BLHFCQUFDQSxhQUFXQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBQbGFuIHBsYW47XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBsYXN0U2V0V2FzVGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNldElkO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2VsZWN0ZWREYXk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGRheUlkO1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmdbXSBkYXlzID0geyBcIm1vbmRheVwiLCBcInR1ZXNkYXlcIiwgXCJ3ZWRuZXNkYXlcIiwgXCJ0aHVyc2RheVwiLCBcImZyaWRheVwiIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXRzID0gR2NsKFwidGVhY2hlci1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIHRydWUpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcInN0dWRlbnQtY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCBmYWxzZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwiYnV0LXRpbWUtc2V0XCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBjID0gaTtcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBTb21lRGF5RWRpdEhvdXJzQ2xpY2soYnV0c1tjXSk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnNcIikuT25DbGljayA9IChlKSA9PiB7IFNhdmVIb3VyQ2hhbmdlKCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWhvdXJzLWNhbmNlbFwiKS5PbkNsaWNrID0gKGUpID0+IHsgUmVtb3ZlSG91ckluRGF5KCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInJ1blwiKS5PbkNsaWNrID0gKGUpID0+IHsgcGxhbi5DYWxjKCk7IEdpZChcIm91dHB1dFwiKS5Jbm5lckhUTUwgPSBwbGFuLkdlbmVyYXRlSFRNTCgpOyB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdUZWFjaGVyKEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJ0ZWFjaGVyLW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3VGVhY2hlck5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1RlYWNoZXJOYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihuZXdUZWFjaGVyTmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwidGVhY2hlcnNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdUZWFjaGVyTmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4udGVhY2hlcnMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIHRydWUpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgLy8gQWxsb3cgb25seSBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICBHaWQoXCJhZGQtbmV3LXRlYWNoZXItbW9kYWwtYnV0dG9uXCIpLlJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdTdHVkZW50KEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJzdHVkZW50LW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3U3R1ZGVudE5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1N0dWRlbnROYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihuZXdTdHVkZW50TmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwic3R1ZGVudHNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdTdHVkZW50TmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4uc3R1ZGVudHMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIGZhbHNlKTsgfTtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgRWRpdEhvdXJzQ2xpY2sob2JqZWN0IHNlbmRlciwgYm9vbCB3YXNUZWFjaGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGFzdFNldFdhc1RlYWNoZXIgPSB3YXNUZWFjaGVyO1xyXG4gICAgICAgICAgICBsYXN0U2V0SWQgPSBpbnQuUGFyc2UoKHNlbmRlciBhcyBIVE1MRWxlbWVudCkuR2V0QXR0cmlidXRlKFwibmFtZVwiKSk7XHJcbiAgICAgICAgICAgIExpc3Q8VXNlcj4gc2VsZWN0ZWRDb2xsZWN0aW9uID0gKHdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cyk7XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1tb25kYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgwKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtdHVlc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDEpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS13ZWRuZXNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgyKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtdGh1cnNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgzKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtZnJpZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoNCk7XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXRUaW1lTW9kYWxJbmZvVGV4dFwiKS5Jbm5lckhUTUwgPSBcIlYgdGVudG8gZGVuIG3DoSBcIiArIHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLm5hbWUgKyBcIiDEjWFzXCI7XHJcblxyXG4gICAgICAgICAgICBVcGRhdGVMaXN0T2ZEYXlzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFNvbWVEYXlFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZGF5SWQgPSBpbnQuUGFyc2UoKHNlbmRlciBhcyBIVE1MRWxlbWVudCkuR2V0QXR0cmlidXRlKFwibmFtZVwiKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21ISCA9IEdpZChcImdldC10aW1lLWZyb20taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVGcm9tTU0gPSBHaWQoXCJnZXQtdGltZS1mcm9tLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lVG9ISCA9IEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lVG9NTSA9IEdpZChcImdldC10aW1lLXRvLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXNyID0gY29sbGVjdGlvbltsYXN0U2V0SWRdO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRnJvbSA9IChpbnQpTWF0aC5GbG9vcih1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tSEguVmFsdWUgPSBob3Vyc0Zyb20uVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSAodXNyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzRnJvbSAqIDYwKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbU1NLlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBob3Vyc1RvID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb0hILlZhbHVlID0gaG91cnNUby5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvTU0uVmFsdWUgPSAodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLSBob3Vyc1RvICogNjBkKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFNhdmVIb3VyQ2hhbmdlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGZyb20gPSAoaW50KShpbnQuUGFyc2UoKEdpZChcImdldC10aW1lLWZyb20taGhcIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpICogNjAgKyBpbnQuUGFyc2UoKEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIGludCB0byA9IChpbnQpKGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpICogNjAgKyBpbnQuUGFyc2UoKEdpZChcImdldC10aW1lLXRvLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZyb20gKyBQbGFuLmxlc3Nvbkxlbmd0aCA+IHRvKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFJlbW92ZUhvdXJJbkRheSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdID0gZnJvbTtcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gdG87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggeyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFJlbW92ZUhvdXJJbkRheSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBVcGRhdGVMaXN0T2ZEYXlzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0byBhbGwgZGF5czogaWYgdGhlcmUgaXMgYXQgbGVhc3Qge1BsYW4ubGVzc29uTGVuZ3RofSAoNTApIG1pbnV0ZXMgYmV0d2VlbiB0d28gdGltZXM6IHJldHVybiB0aW1lcyBpbiBmb3JtYXQgW1wiSEg6TU0gLSBISDpNTVwiXSwgZWxzZSwgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCJcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCA1OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEdpZChcInNldC10aW1lLVwiICsgZGF5c1tpXSkuSW5uZXJIVE1MID0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSAtIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtpXSA8IFBsYW4ubGVzc29uTGVuZ3RoID8gXCJOZW7DrSBuYXN0YXZlbm9cIiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtpXSkgKyBcIiAtIFwiICsgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoaW50IG1pbnV0ZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgaG91cnMgPSAoaW50KU1hdGguRmxvb3IobWludXRlcyAvIDYwZCk7XHJcbiAgICAgICAgICAgIHJldHVybiBob3Vycy5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAobWludXRlcyAtIGhvdXJzICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmcgTXlOdW1iZXJUb1N0cmluZ1dpdGhBdExlYXN0VHdvRGlnaXRzRm9ybWF0KGludCBudW1iZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgbnVtID0gbnVtYmVyLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGlmIChudW0uTGVuZ3RoID09IDEpXHJcbiAgICAgICAgICAgICAgICBudW0gPSBcIjBcIiArIG51bTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50IEdpZChzdHJpbmcgaWQpIHtyZXR1cm4gRG9jdW1lbnQuR2V0RWxlbWVudEJ5SWQoaWQpO31cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudFtdIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9BcnJheTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oRG9jdW1lbnQuQm9keS5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscykpO31cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBsZXNzb25MZW5ndGggPSA1MDsgLy8gNDUgKyA1IHBhdXNlXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnMgPSAzOyAvLyBCcmVhayBhZnRlciAzIGxlc3NvbnNcclxuICAgICAgICBwcml2YXRlIGNvbnN0IGludCBicmVha0FmdGVyTGVzc29uc0xlbmd0aCA9IDE1OyAvLyBMZXQncyBqdXN0IHNsZWVwIGEgYml0IFxyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdlbmVyYXRlSFRNTCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcyA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICB2YXIgbm90UG9zU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQpKTtcclxuICAgICAgICAgICAgdmFyIHBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3RQb3NTdHVkZW50cy5Db3VudCgpID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtZGFuZ2VyIGFsZXJ0LWRpc21pc3NpYmxlIGZhZGUgc2hvd1xcXCJyb2xlPVxcXCJhbGVydFxcXCJcIikrXHJcbnN0cmluZy5Gb3JtYXQoXCI8cD5OZXBvZGHFmWlsbyBzZSBuYWrDrXQgbcOtc3RvIHBybyB7MH0geiB7MX0gxb7DoWvFryBcIixub3RQb3NTdHVkZW50cy5Db3VudCgpLHN0dWRlbnRzLkNvdW50KStcclxuc3RyaW5nLkZvcm1hdChcIih7MH0pPC9wPlwiLFN0cmluZy5Kb2luKFwiLCBcIiwgbm90UG9zU3R1ZGVudHMuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkuVG9BcnJheSgpKSkrXHJcbnN0cmluZy5Gb3JtYXQoXCI8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImNsb3NlXFxcIiBkYXRhLWRpc21pc3M9XFxcImFsZXJ0XFxcIiBhcmlhLWxhYmVsPVxcXCJDbG9zZVxcXCI+XCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPsOXPC9zcGFuPjwvYnV0dG9uPjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RyaW5nW10gZGF5cyA9IHsgXCJQb25kxJtsw61cIiwgXCLDmnRlcsO9XCIsIFwiU3TFmWVkYVwiLCBcIsSMdHZydGVrXCIsIFwiUMOhdGVrXCIgfTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzICs9IHN0cmluZy5Gb3JtYXQoXCI8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIj48aDM+ezB9PC9oMz5cIixkYXlzW2RheV0pO1xyXG4gICAgICAgICAgICAgICAgLy8gPGRpdiBjbGFzcz1cImNhcmQgY2FyZC1ib2R5XCI+UGV0ciAoMTA6MDAgLSAxMDo1MCk8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHNzZGF5ID0gcG9zU3R1ZGVudHMuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWREYXkgPT0gZGF5KSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwc3NkYXkuTGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBcIjxpPk5hIHRlbnRvIGRlbiBuZW7DrSBuaWMgbmFwbMOhbm92YW7DqWhvPC9pPlwiO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgcHNzZGF5Lkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFVzZXIgY3VycmVudCA9IHBzc2RheVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNUbyA9IChpbnQpTWF0aC5GbG9vcigoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGgpIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nIGhGcm9tID0gaG91cnNGcm9tLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyAtIGhvdXJzRnJvbSAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoVG8gPSBob3Vyc1RvLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aCAtIGhvdXJzVG8gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPnswfSAoXCIsY3VycmVudC5uYW1lKStcclxuc3RyaW5nLkZvcm1hdChcInswfSAtIHsxfSk8L2Rpdj5cIixoRnJvbSxoVG8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gXCI8L2Rpdj48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOT1RFOiBJIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2FsYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBIT1cgVEhJUyBXT1JLUzpcclxuXHJcblxyXG4gICAgICAgICAgICAvLyAxLjApIFNldCBzdGFydCB0aW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lIG9mIHRoZSBkYXlcclxuICAgICAgICAgICAgLy8gMS4xKSBGaW5kIHN0dWRlbnQgd2hvIGhhcyBzdGFydGluZyB0aW1lIHRoZSBzYW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lLiBJZiB5ZXMsIHBvcyBhbmQgcmVwZWF0IDEpIDQ1IG1pbnV0ZXMgbGF0ZXIuXHJcbiAgICAgICAgICAgIC8vICAgICAgSWYgbm90LCBtb3ZlIGJ5IDUgbWludXRlcyBhbmQgdHJ5IGl0IGFnYWluIHdpdGggYWxsIHN0dWRlbnRzLiBJZiBoaXQgdGVhY2hlcidzIGVuZCB0aW1lLCBtb3ZlIHRvIG5leHQgZGF5XHJcblxyXG4gICAgICAgICAgICAvLyBPUFRJTUFMSVpBVElPTjogQ2hlY2sgaWYgYm90aCB0ZWFjaGVyIGFuZCBzdHVkZW50cyBoYXZlIHNvbWUgbWludXRlcyBpbiBjb21tb24uIElmIG5vdCwgc2tpcCB0aGlzIGRheVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYWxsIHN0dWRlbnRzIGFyZSBwb3NpdGlvbmVkLCBlbmQuIElmIG5vdCwgaGVhZCB0byBzdGVwIDJcclxuXHJcbiAgICAgICAgICAgIC8vIDIuMCkgSSBoYXZlIHNvbWUgc3R1ZGVudHMgd2l0aG91dCBhc3NpZ25lZCBob3Vycy4gUGljayBzdHVkZW50IHdpdGggbGVhc3QgcG9zc2libGUgaG91cnMuIEZpbmQgYWxsXHJcbiAgICAgICAgICAgIC8vICAgICAgaG91cnMgd2hlcmUgSSBjYW4gcG9zIHRoaXMgc3R1ZGVudCBpbiBhbGwgZGF5cy5cclxuICAgICAgICAgICAgLy8gMi4xKSBDaG9vc2UgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBsZWFzdCB1bmFzc2lnbmVkIHN0dWRlbnRzIGNhbiBnby4gQWZ0ZXIgdGhhdCwgY2hvb3NlIHBvc2l0aW9uIHdoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgaXMgc3R1ZGVudCB3aXRoIG1vc3QgZnJlZSB0aW1lXHJcbiAgICAgICAgICAgIC8vIDIuMikgU3dhcCB0aG9zZSBzdHVkZW50c1xyXG4gICAgICAgICAgICAvLyAyLjMpIFJlcGVhdC4gSWYgYWxyZWFkeSByZXBlYXRlZCBOIHRpbWVzLCB3aGVyZSBOIGlzIG51bWJlciBvZiB1bmFzc2lnbmVkIHN0dWRlbnRzIGF0IHRoZSBiZWdnaW5pbmcgb2YgcGhhc2UgMixcclxuICAgICAgICAgICAgLy8gICAgICBlbmQsIHNob3cgYWxsIHBvc2l0aW9uZWQgc3R1ZGVudHMgYW5kIHJlcG9ydCBmYWlsdXJlXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZWFjaGVycy5Db3VudCAhPSAxIHx8IHN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBSZXNldCBwcmV2aW91cyBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWREYXkgPSAtMTtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkTWludXRlcyA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJzdCBzdGFnZVxyXG4gICAgICAgICAgICBUcnlUb1Bvc0FsbFN0dWRlbnRzVmVyMigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFRyeVRvUG9zQWxsU3R1ZGVudHNWZXIyKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDwgbGVzc29uTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1RvZGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IHBvc3NlZEhvdXJzID0gMDtcclxuICAgICAgICAgICAgICAgIGludCBtaW51dGVQb3NzZWQgPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0dWRlbnRzVG9kYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTXV6ZSBzZSBzdGF0LCB6ZSB0ZW4gc3R1ZGVudCBzIG5lam1pbiB2ZWxueWhvIGNhc3UgYnVkZSBtZXJtb21vY2kgdmVwcmVkdSBhIGJ1ZGUgYmxva292YXQgbWlzdG8gcHJvIGppbnlobywgaSBrZHl6IGJ5IHNlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdiBwb2hvZGUgdmVzZWwgamVzdGUgZG96YWR1LiBUcmViYSBBIG1hIG1pbiBjYXN1IG5leiBCLiBBOiAxMjozMC0xNTowMCwgQjogMTI6MDAtMTc6MDAsIHZ5c2xlZGVrIGJ1ZGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBBOiAxMjozMC0xMzoyMCwgQjogMTM6MjAtMTQ6MTAgTUlTVE8gQiA6MTI6MDAgLSAxMjo1MCwgQTogMTI6NTAtMTM6NDBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgbWludXRlID0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldOyBtaW51dGUgPD0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzVG9BdmFpbGFibGVbZGF5XTsgbWludXRlICs9IDUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWludXRlID49IG1pbnV0ZVBvc3NlZCAmJiBtaW51dGUgPD0gbWludXRlUG9zc2VkICsgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1RpbWVGcmFtZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzVG9kYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQgJiYgeC5hc3NpZ25lZERheSA9PSBkYXkgJiYgeC5hc3NpZ25lZE1pbnV0ZXMgPj0gbWludXRlIC0gbGVzc29uTGVuZ3RoICYmIHguYXNzaWduZWRNaW51dGVzIDw9IG1pbnV0ZSArIGxlc3Nvbkxlbmd0aCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzSW5UaGlzVGltZUZyYW1lLkNvdW50KCkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzZWRIb3VycysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihwb3NzZWRIb3VycyA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMgPSBpbnQuTWluVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVQb3NzZWQgPSBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFRyeVRvUG9zQWxsU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gQXNzdW1pbmcgSSBoYXZlIGp1c3Qgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gRm9yIGFsbCBkYXlzLCBza2lwIGRheSBpZiBlaXRoZXIgYWxsIHN0dWRlbnRzIG9yIHRlYWNoZXIgYXJlIGJ1c3lcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIHN0dWRlbnRzIHRoYXQgaGF2ZSBhdCBsZWFzdCA1MG1pbnMgdGltZSB0b2RheSBhbmQgc3RpbGwgZG9uJ3QgaGF2ZSBhbnl0aGluZyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzRm9yVGhpc0RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IDUwICYmICF4LmFzc2lnbmVkKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDwgNTAgfHwgLy8gSWYgdGhlIHRlYWNoZXIgZG9uJ3QgaGF2ZSBmdWxsIDUwIG1pbnV0ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgc3R1ZGVudHNGb3JUaGlzRGF5Lkxlbmd0aCA9PSAwKSAvLyBPciBpZiB0aGVyZSBpcyBubyBzdHVkZW50IHdpdGggYXQgbGVhc3QgNTAgbWludHVlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHbyBmb3IgYWxsIHRoZSB0ZWFjaGVyJ3MgbWludXRlcyB0b2RheVxyXG5cclxuICAgICAgICAgICAgICAgIGludCBob3Vyc0VsYXBzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgbWludXRlID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldOyBtaW51dGUgPD0gdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XTsgbWludXRlICs9IDUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdXJzRWxhcHNlZCA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJzRWxhcHNlZCA9IGludC5NaW5WYWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBicmVha0FmdGVyTGVzc29uc0xlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNJblRoaXNUZXJtID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNGb3JUaGlzRGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoc3R1ZGVudCA9PiBzdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gbWludXRlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldID49IG1pbnV0ZSArIGxlc3Nvbkxlbmd0aCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFVzZXIgY2hvc2VuU3R1ZGVudCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3RPckRlZmF1bHQ8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzSW5UaGlzVGVybSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9zZW5TdHVkZW50ID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkTWludXRlcyA9IG1pbnV0ZTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gbGVzc29uTGVuZ3RoIC0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaG91cnNFbGFwc2VkKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBVc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBuYW1lO1xyXG4gICAgICAgIHB1YmxpYyBib29sW10gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkTWludXRlcyA9IC0xO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWREYXkgPSAtMTtcclxuICAgICAgICBwdWJsaWMgYm9vbCBhc3NpZ25lZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwdWJsaWMgVXNlcihzdHJpbmcgbmFtZSwgYm9vbFtdIGRheXNBdmFpbGFibGUsIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmRheXNBdmFpbGFibGUgPSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNGcm9tQXZhaWxhYmxlID0gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc1RvQXZhaWxhYmxlID0gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZXRIb3Vyc0luRGF5KGludCBkYXlJbmRleClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkYXlJbmRleCA8IDAgfHwgZGF5SW5kZXggPj0gNSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudEV4Y2VwdGlvbihcIlBhcmFtZXRlciBNVVNUIEJFIGluIHJhbmdlIFswOyA1KS4gVmFsdWU6IFwiICsgZGF5SW5kZXgsIFwiZGF5SW5kZXhcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRheXNBdmFpbGFibGVbZGF5SW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCI7XHJcblxyXG4gICAgICAgICAgICBpbnQgbWludXRlc0YgPSBtaW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJbmRleF07XHJcbiAgICAgICAgICAgIGludCBtaW51dGVzVCA9IG1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJbmRleF07XHJcblxyXG4gICAgICAgICAgICBpbnQgaG91cnNGID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNGIC8gNjBkKTtcclxuICAgICAgICAgICAgaW50IGhvdXJzVCA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzVCAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIk9kIHswfTp7MX0gZG8gezJ9OnszfVwiLGhvdXJzRiwobWludXRlc0YgLSBob3Vyc0YgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKSxob3Vyc1QsKG1pbnV0ZXNUIC0gaG91cnNUICogNjApLlRvU3RyaW5nKFwiMDBcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==

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
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    var from = Bridge.Int.clip32((Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement)).valueAsNumber * 60 + (Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement)).valueAsNumber);
                    var to = Bridge.Int.clip32((Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement)).valueAsNumber * 60 + (Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement)).valueAsNumber);

                    if (((from + StudentScheduler.AppLogic.Plan.lessonLength) | 0) > to) {
                        StudentScheduler.App.RemoveHourInDay();
                        return;
                    }

                    ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = from;
                    ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = to;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLHdCQUFLQSxHQUFMQSwyREFBS0EsR0FBTEEsZ0JBQW1CQSxVQUFDQTtvQkFBUUEsb0NBQWVBLHdCQUFLQSxHQUFMQTs7OztZQUUvQ0EsT0FBT0E7WUFDUEEsS0FBS0EsWUFBV0EsS0FBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsSUFBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUU3QkEsY0FBUUE7Z0JBQ1JBLHdCQUFLQSxJQUFMQSwyREFBS0EsSUFBTEEsZ0JBQW1CQTtxQ0FBQ0E7d0JBQVFBLDJDQUFzQkEsd0JBQUtBLEtBQUxBOzs7O1lBRXREQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5Q0FHdkNBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29C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QUM1QkEsMEJBQTBCQTs7OztxQ0FHRkE7Z0JBRXhCQSxJQUFJQSxnQkFBZ0JBO29CQUNoQkEsTUFBTUEsSUFBSUEseUJBQWtCQSwrQ0FBK0NBOzs7Z0JBRS9FQSxJQUFJQSxDQUFDQSxzQ0FBY0EsVUFBZEE7b0JBQ0RBOzs7Z0JBRUpBLGVBQWVBLDZDQUFxQkEsVUFBckJBO2dCQUNmQSxlQUFlQSwyQ0FBbUJBLFVBQW5CQTs7Z0JBRWZBLGFBQWFBLGtCQUFLQSxXQUFXQTtnQkFDN0JBLGFBQWFBLGtCQUFLQSxXQUFXQTs7Z0JBRTdCQSxPQUFPQSw4Q0FBc0NBLGtDQUFPQSxxQkFBQ0EsYUFBV0EsMENBQTRCQSxrQ0FBT0EscUJBQUNBLGFBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBOZXd0b25zb2Z0Lkpzb247XHJcbnVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWM7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZWxlY3RlZERheTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgZGF5SWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZ1tdIGRheXMgPSB7IFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJidXQtdGltZS1zZXRcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGMgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IFNvbWVEYXlFZGl0SG91cnNDbGljayhidXRzW2NdKTsgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vyc1wiKS5PbkNsaWNrID0gKGUpID0+IHsgU2F2ZUhvdXJDaGFuZ2UoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnMtY2FuY2VsXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBSZW1vdmVIb3VySW5EYXkoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwicnVuXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBwbGFuLkNhbGMoKTsgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7IH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgaW50IGZyb20gPSAoaW50KSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyICogNjAgKyAoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuICAgICAgICAgICAgaW50IHRvID0gKGludCkoKEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIgKiA2MCArIChHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmcm9tICsgUGxhbi5sZXNzb25MZW5ndGggPiB0bylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IHRvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZW1vdmVIb3VySW5EYXkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgVXBkYXRlTGlzdE9mRGF5cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdG8gYWxsIGRheXM6IGlmIHRoZXJlIGlzIGF0IGxlYXN0IHtQbGFuLmxlc3Nvbkxlbmd0aH0gKDUwKSBtaW51dGVzIGJldHdlZW4gdHdvIHRpbWVzOiByZXR1cm4gdGltZXMgaW4gZm9ybWF0IFtcIkhIOk1NIC0gSEg6TU1cIl0sIGVsc2UsIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgNTsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1cIiArIGRheXNbaV0pLklubmVySFRNTCA9IGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbaV0gLSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0gPCBQbGFuLmxlc3Nvbkxlbmd0aCA/IFwiTmVuw60gbmFzdGF2ZW5vXCIgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0pICsgXCIgLSBcIiArIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmcgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGludCBtaW51dGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGhvdXJzID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXMgLyA2MGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gaG91cnMuVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKG1pbnV0ZXMgLSBob3VycyAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE15TnVtYmVyVG9TdHJpbmdXaXRoQXRMZWFzdFR3b0RpZ2l0c0Zvcm1hdChpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG51bSA9IG51bWJlci5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAobnVtLkxlbmd0aCA9PSAxKVxyXG4gICAgICAgICAgICAgICAgbnVtID0gXCIwXCIgKyBudW07XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudCBHaWQoc3RyaW5nIGlkKSB7cmV0dXJuIERvY3VtZW50LkdldEVsZW1lbnRCeUlkKGlkKTt9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnRbXSBHY2woc3RyaW5nIGNscykge3JldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvQXJyYXk8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpKTt9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGxhblxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgbGVzc29uTGVuZ3RoID0gNTA7IC8vIDQ1ICsgNSBwYXVzZVxyXG4gICAgICAgIHByaXZhdGUgY29uc3QgaW50IGJyZWFrQWZ0ZXJMZXNzb25zID0gMzsgLy8gQnJlYWsgYWZ0ZXIgMyBsZXNzb25zXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggPSAxNTsgLy8gTGV0J3MganVzdCBzbGVlcCBhIGJpdCBcclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZW5lcmF0ZUhUTUwoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHMgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5vdFBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkKSk7XHJcbiAgICAgICAgICAgIHZhciBwb3NTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm90UG9zU3R1ZGVudHMuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWRhbmdlciBhbGVydC1kaXNtaXNzaWJsZSBmYWRlIHNob3dcXFwicm9sZT1cXFwiYWxlcnRcXFwiXCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHA+TmVwb2RhxZlpbG8gc2UgbmFqw610IG3DrXN0byBwcm8gezB9IHogezF9IMW+w6Frxa8gXCIsbm90UG9zU3R1ZGVudHMuQ291bnQoKSxzdHVkZW50cy5Db3VudCkrXHJcbnN0cmluZy5Gb3JtYXQoXCIoezB9KTwvcD5cIixTdHJpbmcuSm9pbihcIiwgXCIsIG5vdFBvc1N0dWRlbnRzLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSkpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJhbGVydFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlwiKStcclxuc3RyaW5nLkZvcm1hdChcIjxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj7Dlzwvc3Bhbj48L2J1dHRvbj48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0cmluZ1tdIGRheXMgPSB7IFwiUG9uZMSbbMOtXCIsIFwiw5p0ZXLDvVwiLCBcIlN0xZllZGFcIiwgXCLEjHR2cnRla1wiLCBcIlDDoXRla1wiIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwicm93XFxcIj48ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCI+PGgzPnswfTwvaDM+XCIsZGF5c1tkYXldKTtcclxuICAgICAgICAgICAgICAgIC8vIDxkaXYgY2xhc3M9XCJjYXJkIGNhcmQtYm9keVwiPlBldHIgKDEwOjAwIC0gMTA6NTApPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBzc2RheSA9IHBvc1N0dWRlbnRzLldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkRGF5ID09IGRheSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHNzZGF5Lkxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCI8aT5OYSB0ZW50byBkZW4gbmVuw60gbmljIG5hcGzDoW5vdmFuw6lobzwvaT5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHBzc2RheS5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGN1cnJlbnQgPSBwc3NkYXlbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzRnJvbSA9IChpbnQpTWF0aC5GbG9vcihjdXJyZW50LmFzc2lnbmVkTWludXRlcyAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IoKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzICsgbGVzc29uTGVuZ3RoKSAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoRnJvbSA9IGhvdXJzRnJvbS5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgLSBob3Vyc0Zyb20gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaFRvID0gaG91cnNUby5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGggLSBob3Vyc1RvICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIj57MH0gKFwiLGN1cnJlbnQubmFtZSkrXHJcbnN0cmluZy5Gb3JtYXQoXCJ7MH0gLSB7MX0pPC9kaXY+XCIsaEZyb20saFRvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzICs9IFwiPC9kaXY+PC9kaXY+XCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTk9URTogSSBhc3N1bWUgdGhlcmUgaXMgb25seSBvbmUgdGVhY2hlclxyXG4gICAgICAgIHB1YmxpYyB2b2lkIENhbGMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gSE9XIFRISVMgV09SS1M6XHJcblxyXG5cclxuICAgICAgICAgICAgLy8gMS4wKSBTZXQgc3RhcnQgdGltZSBhcyB0ZWFjaGVyJ3Mgc3RhcnQgdGltZSBvZiB0aGUgZGF5XHJcbiAgICAgICAgICAgIC8vIDEuMSkgRmluZCBzdHVkZW50IHdobyBoYXMgc3RhcnRpbmcgdGltZSB0aGUgc2FtZSBhcyB0ZWFjaGVyJ3Mgc3RhcnQgdGltZS4gSWYgeWVzLCBwb3MgYW5kIHJlcGVhdCAxKSA0NSBtaW51dGVzIGxhdGVyLlxyXG4gICAgICAgICAgICAvLyAgICAgIElmIG5vdCwgbW92ZSBieSA1IG1pbnV0ZXMgYW5kIHRyeSBpdCBhZ2FpbiB3aXRoIGFsbCBzdHVkZW50cy4gSWYgaGl0IHRlYWNoZXIncyBlbmQgdGltZSwgbW92ZSB0byBuZXh0IGRheVxyXG5cclxuICAgICAgICAgICAgLy8gT1BUSU1BTElaQVRJT046IENoZWNrIGlmIGJvdGggdGVhY2hlciBhbmQgc3R1ZGVudHMgaGF2ZSBzb21lIG1pbnV0ZXMgaW4gY29tbW9uLiBJZiBub3QsIHNraXAgdGhpcyBkYXlcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGFsbCBzdHVkZW50cyBhcmUgcG9zaXRpb25lZCwgZW5kLiBJZiBub3QsIGhlYWQgdG8gc3RlcCAyXHJcblxyXG4gICAgICAgICAgICAvLyAyLjApIEkgaGF2ZSBzb21lIHN0dWRlbnRzIHdpdGhvdXQgYXNzaWduZWQgaG91cnMuIFBpY2sgc3R1ZGVudCB3aXRoIGxlYXN0IHBvc3NpYmxlIGhvdXJzLiBGaW5kIGFsbFxyXG4gICAgICAgICAgICAvLyAgICAgIGhvdXJzIHdoZXJlIEkgY2FuIHBvcyB0aGlzIHN0dWRlbnQgaW4gYWxsIGRheXMuXHJcbiAgICAgICAgICAgIC8vIDIuMSkgQ2hvb3NlIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgbGVhc3QgdW5hc3NpZ25lZCBzdHVkZW50cyBjYW4gZ28uIEFmdGVyIHRoYXQsIGNob29zZSBwb3NpdGlvbiB3aGVyZVxyXG4gICAgICAgICAgICAvLyAgICAgIGlzIHN0dWRlbnQgd2l0aCBtb3N0IGZyZWUgdGltZVxyXG4gICAgICAgICAgICAvLyAyLjIpIFN3YXAgdGhvc2Ugc3R1ZGVudHNcclxuICAgICAgICAgICAgLy8gMi4zKSBSZXBlYXQuIElmIGFscmVhZHkgcmVwZWF0ZWQgTiB0aW1lcywgd2hlcmUgTiBpcyBudW1iZXIgb2YgdW5hc3NpZ25lZCBzdHVkZW50cyBhdCB0aGUgYmVnZ2luaW5nIG9mIHBoYXNlIDIsXHJcbiAgICAgICAgICAgIC8vICAgICAgZW5kLCBzaG93IGFsbCBwb3NpdGlvbmVkIHN0dWRlbnRzIGFuZCByZXBvcnQgZmFpbHVyZVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodGVhY2hlcnMuQ291bnQgIT0gMSB8fCBzdHVkZW50cy5Db3VudCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgcHJldmlvdXMgY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgc3R1ZGVudHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRmlyc3Qgc3RhZ2VcclxuICAgICAgICAgICAgVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBUcnlUb1Bvc0FsbFN0dWRlbnRzVmVyMigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNUb2RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWRIb3VycyA9IDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgbWludXRlUG9zc2VkID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50c1RvZGF5Lkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IE11emUgc2Ugc3RhdCwgemUgdGVuIHN0dWRlbnQgcyBuZWptaW4gdmVsbnlobyBjYXN1IGJ1ZGUgbWVybW9tb2NpIHZlcHJlZHUgYSBidWRlIGJsb2tvdmF0IG1pc3RvIHBybyBqaW55aG8sIGkga2R5eiBieSBzZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHYgcG9ob2RlIHZlc2VsIGplc3RlIGRvemFkdS4gVHJlYmEgQSBtYSBtaW4gY2FzdSBuZXogQi4gQTogMTI6MzAtMTU6MDAsIEI6IDEyOjAwLTE3OjAwLCB2eXNsZWRlayBidWRlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQTogMTI6MzAtMTM6MjAsIEI6IDEzOjIwLTE0OjEwIE1JU1RPIEIgOjEyOjAwIC0gMTI6NTAsIEE6IDEyOjUwLTEzOjQwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZSA+PSBtaW51dGVQb3NzZWQgJiYgbWludXRlIDw9IG1pbnV0ZVBvc3NlZCArIGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkICYmIHguYXNzaWduZWREYXkgPT0gZGF5ICYmIHguYXNzaWduZWRNaW51dGVzID49IG1pbnV0ZSAtIGxlc3Nvbkxlbmd0aCAmJiB4LmFzc2lnbmVkTWludXRlcyA8PSBtaW51dGUgKyBsZXNzb25MZW5ndGgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHVkZW50c0luVGhpc1RpbWVGcmFtZS5Db3VudCgpID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzVG9kYXlbaV0uYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzVG9kYXlbaV0uYXNzaWduZWRNaW51dGVzID0gbWludXRlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocG9zc2VkSG91cnMgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzID0gaW50Lk1pblZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlUG9zc2VkID0gbWludXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBUcnlUb1Bvc0FsbFN0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEFzc3VtaW5nIEkgaGF2ZSBqdXN0IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIEZvciBhbGwgZGF5cywgc2tpcCBkYXkgaWYgZWl0aGVyIGFsbCBzdHVkZW50cyBvciB0ZWFjaGVyIGFyZSBidXN5XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBzdHVkZW50cyB0aGF0IGhhdmUgYXQgbGVhc3QgNTBtaW5zIHRpbWUgdG9kYXkgYW5kIHN0aWxsIGRvbid0IGhhdmUgYW55dGhpbmcgYXNzaWduZWRcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0ZvclRoaXNEYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSA1MCAmJiAheC5hc3NpZ25lZCkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IDUwIHx8IC8vIElmIHRoZSB0ZWFjaGVyIGRvbid0IGhhdmUgZnVsbCA1MCBtaW51dGVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzRm9yVGhpc0RheS5MZW5ndGggPT0gMCkgLy8gT3IgaWYgdGhlcmUgaXMgbm8gc3R1ZGVudCB3aXRoIGF0IGxlYXN0IDUwIG1pbnR1ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR28gZm9yIGFsbCB0aGUgdGVhY2hlcidzIG1pbnV0ZXMgdG9kYXlcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3Vyc0VsYXBzZWQgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQgPSBpbnQuTWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzSW5UaGlzVGVybSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzRm9yVGhpc0RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IG1pbnV0ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA+PSBtaW51dGUgKyBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGNob3NlblN0dWRlbnQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0T3JEZWZhdWx0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0luVGhpc1Rlcm0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvc2VuU3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGxlc3Nvbkxlbmd0aCAtIDU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzRWxhcHNlZCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVXNlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgcHVibGljIGJvb2wgYXNzaWduZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0SG91cnNJbkRheShpbnQgZGF5SW5kZXgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF5SW5kZXggPCAwIHx8IGRheUluZGV4ID49IDUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oXCJQYXJhbWV0ZXIgTVVTVCBCRSBpbiByYW5nZSBbMDsgNSkuIFZhbHVlOiBcIiArIGRheUluZGV4LCBcImRheUluZGV4XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2RheUluZGV4XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiO1xyXG5cclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNGID0gbWludXRlc0Zyb21BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG4gICAgICAgICAgICBpbnQgbWludXRlc1QgPSBtaW51dGVzVG9BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgaW50IGhvdXJzRiA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzRiAvIDYwZCk7XHJcbiAgICAgICAgICAgIGludCBob3Vyc1QgPSAoaW50KU1hdGguRmxvb3IobWludXRlc1QgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJPZCB7MH06ezF9IGRvIHsyfTp7M31cIixob3Vyc0YsKG1pbnV0ZXNGIC0gaG91cnNGICogNjApLlRvU3RyaW5nKFwiMDBcIiksaG91cnNULChtaW51dGVzVCAtIGhvdXJzVCAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=

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
                    var ret = (StudentScheduler.App.MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskItself(hours) || "") + ":";
                    return (ret || "") + (StudentScheduler.App.MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskItself((((minutes - Bridge.Int.mul(hours, 60)) | 0))) || "");
                },
                MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskItself: function (number) {
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
                    this.breakAfterLessonsLength = 45;
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

                // First stage
                this.TryToPosAllStudents();
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
                            // I assume there is no need to repeat the break multiple times in a single day
                            hoursElapsed = -2147483648;

                            minute.v = (minute.v + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0; // TODO: Should I substract 5?
                            continue;
                        }

                        var studentsInThisTerm = System.Linq.Enumerable.from(studentsForThisDay).where((function ($me, minute) {
                                return function (student) {
                                    return student.minutesFromAvailable[System.Array.index(day, student.minutesFromAvailable)] <= minute.v && student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] >= teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)];
                                };
                            })(this, minute));

                        // Choose student with the least time left
                        var chosenStudent = studentsInThisTerm.orderBy((function ($me, minute) {
                            return function (student) {
                                return ((student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] - minute.v) | 0);
                            };
                        })(this, minute)).firstOrDefault(null, null);

                        if (chosenStudent == null) {
                            continue;
                        }

                        chosenStudent.assignedMinutes = minute.v;
                        chosenStudent.assignedDay = day;
                        chosenStudent.assigned = true;
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

                return System.String.format("Od {0}:{1} do {2}:{3}", Bridge.box(hoursF, System.Int32), System.Int32.format((((minutesF - Bridge.Int.mul(hoursF, 60)) | 0)), "###"), Bridge.box(hoursT, System.Int32), System.Int32.format((((minutesT - Bridge.Int.mul(hoursT, 60)) | 0)), "##"));
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O1lBd0JZQSw0QkFBT0EsSUFBSUE7OztZQUdYQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7O1lBQ2hEQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7OztZQUVoREEsV0FBV0E7WUFDWEEsS0FBS0EsV0FBV0EsSUFBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsR0FBTEEsMkRBQUtBLEdBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsR0FBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUM3QkEsd0JBQUtBLElBQUxBLDJEQUFLQSxJQUFMQSxnQkFBbUJBLFVBQUNBO29CQUFRQSxvQ0FBZUEsd0JBQUtBLElBQUxBOzs7O1lBRS9DQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkE7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLHdCQUFLQSxLQUFMQTs7OztZQUV0REEscURBQWdDQSxVQUFDQTtnQkFBUUE7Z0JBQWtCQTs7O1lBRTNEQSw0REFBdUNBLFVBQUNBO2dCQUFRQTtnQkFBbUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBR3JDQTs7b0JBRzlCQSxZQUF5QkEsQ0FBQ0Esc0NBQStEQSwyRkFBb0ZBLEFBQThEQTttQ0FBS0EsNkJBQVFBOztvQkFDeFBBLHFCQUF3QkE7b0JBQ3hCQSxJQUFJQTt3QkFDQUE7OztvQkFFSkEs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QTJCQSxLQUEzQkE7Ozs7O3dCQUdyRkEsb0JBQXFCQSwyQkFBZ0NBLEFBQW1FQTs7dUNBQVdBLGdEQUEyQkEsS0FBM0JBLCtCQUFrQ0E7Ozs7d0JBRXJLQSxJQUFJQSxpQkFBaUJBOzRCQUNqQkE7Ozt3QkFFSkEsZ0NBQWdDQTt3QkFDaENBLDRCQUE0QkE7d0JBQzVCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1Q0N0RmlCQTttQ0FDSkE7Ozs0QkFHYkEsTUFBYUEsZUFBc0JBLHNCQUE0QkE7O2dCQUV2RUEsWUFBWUE7Z0JBQ1pBLHFCQUFxQkE7Z0JBQ3JCQSw0QkFBNEJBO2dCQUM1QkEsMEJBQTBCQTs7OztxQ0FHRkE7Z0JBRXhCQSxJQUFJQSxnQkFBZ0JBO29CQUNoQkEsTUFBTUEsSUFBSUEseUJBQWtCQSwrQ0FBK0NBOzs7Z0JBRS9FQSxJQUFJQSxDQUFDQSxzQ0FBY0EsVUFBZEE7b0JBQ0RBOzs7Z0JBRUpBLGVBQWVBLDZDQUFxQkEsVUFBckJBO2dCQUNmQSxlQUFlQSwyQ0FBbUJBLFVBQW5CQTs7Z0JBRWZBLGFBQWFBLGtCQUFLQSxXQUFXQTtnQkFDN0JBLGFBQWFBLGtCQUFLQSxXQUFXQTs7Z0JBRTdCQSxPQUFPQSw4Q0FBc0NBLGtDQUFPQSxxQkFBQ0EsYUFBV0EsMkNBQTZCQSxrQ0FBT0EscUJBQUNBLGFBQVdBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBOZXd0b25zb2Z0Lkpzb247XHJcbnVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWM7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZWxlY3RlZERheTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgZGF5SWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZ1tdIGRheXMgPSB7IFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXRzID0gR2NsKFwidGVhY2hlci1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIHRydWUpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcInN0dWRlbnQtY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCBmYWxzZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwiYnV0LXRpbWUtc2V0XCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBjID0gaTtcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBTb21lRGF5RWRpdEhvdXJzQ2xpY2soYnV0c1tjXSk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnNcIikuT25DbGljayA9IChlKSA9PiB7IFNhdmVIb3VyQ2hhbmdlKCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWhvdXJzLWNhbmNlbFwiKS5PbkNsaWNrID0gKGUpID0+IHsgUmVtb3ZlSG91ckluRGF5KCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3VGVhY2hlcihIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwidGVhY2hlci1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1RlYWNoZXJOYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdUZWFjaGVyTmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi50ZWFjaGVycy5BZGQobmV3IFVzZXIobmV3VGVhY2hlck5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInRlYWNoZXJzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3VGVhY2hlck5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCB0cnVlKTsgfTtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbG93IG9ubHkgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgR2lkKFwiYWRkLW5ldy10ZWFjaGVyLW1vZGFsLWJ1dHRvblwiKS5SZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3U3R1ZGVudChIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwic3R1ZGVudC1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1N0dWRlbnROYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdTdHVkZW50TmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIobmV3U3R1ZGVudE5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInN0dWRlbnRzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3U3R1ZGVudE5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnN0dWRlbnRzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCBmYWxzZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIsIGJvb2wgd2FzVGVhY2hlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhc3RTZXRXYXNUZWFjaGVyID0gd2FzVGVhY2hlcjtcclxuICAgICAgICAgICAgbGFzdFNldElkID0gaW50LlBhcnNlKChzZW5kZXIgYXMgSFRNTEVsZW1lbnQpLkdldEF0dHJpYnV0ZShcIm5hbWVcIikpO1xyXG4gICAgICAgICAgICBMaXN0PFVzZXI+IHNlbGVjdGVkQ29sbGVjdGlvbiA9ICh3YXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHMpO1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtbW9uZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMCk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXR1ZXNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgxKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtd2VkbmVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMik7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXRodXJzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMyk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWZyaWRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDQpO1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0VGltZU1vZGFsSW5mb1RleHRcIikuSW5uZXJIVE1MID0gXCJWIHRlbnRvIGRlbiBtw6EgXCIgKyBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5uYW1lICsgXCIgxI1hc1wiO1xyXG5cclxuICAgICAgICAgICAgVXBkYXRlTGlzdE9mRGF5cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBTb21lRGF5RWRpdEhvdXJzQ2xpY2sob2JqZWN0IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRheUlkID0gaW50LlBhcnNlKChzZW5kZXIgYXMgSFRNTEVsZW1lbnQpLkdldEF0dHJpYnV0ZShcIm5hbWVcIikpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGdldFRpbWVGcm9tSEggPSBHaWQoXCJnZXQtdGltZS1mcm9tLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbU1NID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZVRvSEggPSBHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZVRvTU0gPSBHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVzciA9IGNvbGxlY3Rpb25bbGFzdFNldElkXTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodXNyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBob3Vyc0Zyb20gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gaG91cnNGcm9tLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbU1NLlZhbHVlID0gKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLSBob3Vyc0Zyb20gKiA2MCkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tSEguVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNUbyA9IChpbnQpTWF0aC5GbG9vcih1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IGhvdXJzVG8uVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb01NLlZhbHVlID0gKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNUbyAqIDYwZCkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb0hILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb01NLlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBTYXZlSG91ckNoYW5nZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICBpbnQgZnJvbSA9IChpbnQpKChHaWQoXCJnZXQtdGltZS1mcm9tLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIgKiA2MCArIChHaWQoXCJnZXQtdGltZS1mcm9tLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIpO1xyXG4gICAgICAgICAgICBpbnQgdG8gPSAoaW50KSgoR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWVBc051bWJlciAqIDYwICsgKEdpZChcImdldC10aW1lLXRvLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZyb20gKyBQbGFuLmxlc3Nvbkxlbmd0aCA+IHRvKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBSZW1vdmVIb3VySW5EYXkoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IGZyb207XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gdG87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFJlbW92ZUhvdXJJbkRheSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBVcGRhdGVMaXN0T2ZEYXlzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0byBhbGwgZGF5czogaWYgdGhlcmUgaXMgYXQgbGVhc3Qge1BsYW4ubGVzc29uTGVuZ3RofSAoNTApIG1pbnV0ZXMgYmV0d2VlbiB0d28gdGltZXM6IHJldHVybiB0aW1lcyBpbiBmb3JtYXQgW1wiSEg6TU0gLSBISDpNTVwiXSwgZWxzZSwgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCJcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCA1OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIEdpZChcInNldC10aW1lLVwiICsgZGF5c1tpXSkuSW5uZXJIVE1MID0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSAtIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtpXSA8IFBsYW4ubGVzc29uTGVuZ3RoID8gXCJOZW7DrSBuYXN0YXZlbm9cIiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtpXSkgKyBcIiAtIFwiICsgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoaW50IG1pbnV0ZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgaG91cnMgPSAoaW50KU1hdGguRmxvb3IobWludXRlcyAvIDYwZCk7XHJcbiAgICAgICAgICAgIHN0cmluZyByZXQgPSBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXRCZWNhdXNlQnJpZGdlRG90TmV0Q2Fubm90RG9UaGF0U2ltcGxlVGFza0l0c2VsZihob3VycykgKyBcIjpcIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJldCArIE15TnVtYmVyVG9TdHJpbmdXaXRoQXRMZWFzdFR3b0RpZ2l0c0Zvcm1hdEJlY2F1c2VCcmlkZ2VEb3ROZXRDYW5ub3REb1RoYXRTaW1wbGVUYXNrSXRzZWxmKChtaW51dGVzIC0gaG91cnMgKiA2MCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE15TnVtYmVyVG9TdHJpbmdXaXRoQXRMZWFzdFR3b0RpZ2l0c0Zvcm1hdEJlY2F1c2VCcmlkZ2VEb3ROZXRDYW5ub3REb1RoYXRTaW1wbGVUYXNrSXRzZWxmKGludCBudW1iZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgbnVtID0gbnVtYmVyLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGlmIChudW0uTGVuZ3RoID09IDEpXHJcbiAgICAgICAgICAgICAgICBudW0gPSBcIjBcIiArIG51bTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50IEdpZChzdHJpbmcgaWQpIHtyZXR1cm4gRG9jdW1lbnQuR2V0RWxlbWVudEJ5SWQoaWQpO31cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudFtdIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9BcnJheTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oRG9jdW1lbnQuQm9keS5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscykpO31cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBsZXNzb25MZW5ndGggPSA1MDsgLy8gNDUgKyA1IHBhdXNlXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnMgPSAzOyAvLyBCcmVhayBhZnRlciAzIGxlc3NvbnNcclxuICAgICAgICBwcml2YXRlIGNvbnN0IGludCBicmVha0FmdGVyTGVzc29uc0xlbmd0aCA9IDQ1OyAvLyBMZXQncyBqdXN0IHNsZWVwIGEgYml0IFxyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOT1RFOiBJIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2FsYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBIT1cgVEhJUyBXT1JLUzpcclxuXHJcblxyXG4gICAgICAgICAgICAvLyAxLjApIFNldCBzdGFydCB0aW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lIG9mIHRoZSBkYXlcclxuICAgICAgICAgICAgLy8gMS4xKSBGaW5kIHN0dWRlbnQgd2hvIGhhcyBzdGFydGluZyB0aW1lIHRoZSBzYW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lLiBJZiB5ZXMsIHBvcyBhbmQgcmVwZWF0IDEpIDQ1IG1pbnV0ZXMgbGF0ZXIuXHJcbiAgICAgICAgICAgIC8vICAgICAgSWYgbm90LCBtb3ZlIGJ5IDUgbWludXRlcyBhbmQgdHJ5IGl0IGFnYWluIHdpdGggYWxsIHN0dWRlbnRzLiBJZiBoaXQgdGVhY2hlcidzIGVuZCB0aW1lLCBtb3ZlIHRvIG5leHQgZGF5XHJcblxyXG4gICAgICAgICAgICAvLyBPUFRJTUFMSVpBVElPTjogQ2hlY2sgaWYgYm90aCB0ZWFjaGVyIGFuZCBzdHVkZW50cyBoYXZlIHNvbWUgbWludXRlcyBpbiBjb21tb24uIElmIG5vdCwgc2tpcCB0aGlzIGRheVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYWxsIHN0dWRlbnRzIGFyZSBwb3NpdGlvbmVkLCBlbmQuIElmIG5vdCwgaGVhZCB0byBzdGVwIDJcclxuXHJcbiAgICAgICAgICAgIC8vIDIuMCkgSSBoYXZlIHNvbWUgc3R1ZGVudHMgd2l0aG91dCBhc3NpZ25lZCBob3Vycy4gUGljayBzdHVkZW50IHdpdGggbGVhc3QgcG9zc2libGUgaG91cnMuIEZpbmQgYWxsXHJcbiAgICAgICAgICAgIC8vICAgICAgaG91cnMgd2hlcmUgSSBjYW4gcG9zIHRoaXMgc3R1ZGVudCBpbiBhbGwgZGF5cy5cclxuICAgICAgICAgICAgLy8gMi4xKSBDaG9vc2UgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBsZWFzdCB1bmFzc2lnbmVkIHN0dWRlbnRzIGNhbiBnby4gQWZ0ZXIgdGhhdCwgY2hvb3NlIHBvc2l0aW9uIHdoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgaXMgc3R1ZGVudCB3aXRoIG1vc3QgZnJlZSB0aW1lXHJcbiAgICAgICAgICAgIC8vIDIuMikgU3dhcCB0aG9zZSBzdHVkZW50c1xyXG4gICAgICAgICAgICAvLyAyLjMpIFJlcGVhdC4gSWYgYWxyZWFkeSByZXBlYXRlZCBOIHRpbWVzLCB3aGVyZSBOIGlzIG51bWJlciBvZiB1bmFzc2lnbmVkIHN0dWRlbnRzIGF0IHRoZSBiZWdnaW5pbmcgb2YgcGhhc2UgMixcclxuICAgICAgICAgICAgLy8gICAgICBlbmQsIHNob3cgYWxsIHBvc2l0aW9uZWQgc3R1ZGVudHMgYW5kIHJlcG9ydCBmYWlsdXJlXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZWFjaGVycy5Db3VudCAhPSAxIHx8IHN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJzdCBzdGFnZVxyXG4gICAgICAgICAgICBUcnlUb1Bvc0FsbFN0dWRlbnRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBGb3IgYWxsIGRheXMsIHNraXAgZGF5IGlmIGVpdGhlciBhbGwgc3R1ZGVudHMgb3IgdGVhY2hlciBhcmUgYnVzeVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdldCBhbGwgc3R1ZGVudHMgdGhhdCBoYXZlIGF0IGxlYXN0IDUwbWlucyB0aW1lIHRvZGF5IGFuZCBzdGlsbCBkb24ndCBoYXZlIGFueXRoaW5nIGFzc2lnbmVkXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNGb3JUaGlzRGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gNTAgJiYgIXguYXNzaWduZWQpKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPCA1MCB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBhbGwgdGhlIHRlYWNoZXIncyBtaW51dGVzIHRvZGF5XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07IG1pbnV0ZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldOyBtaW51dGUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNFbGFwc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSSBhc3N1bWUgdGhlcmUgaXMgbm8gbmVlZCB0byByZXBlYXQgdGhlIGJyZWFrIG11bHRpcGxlIHRpbWVzIGluIGEgc2luZ2xlIGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQgPSBpbnQuTWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7IC8vIFRPRE86IFNob3VsZCBJIHN1YnN0cmFjdCA1P1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1Rlcm0gPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0ZvclRoaXNEYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBDaG9vc2Ugc3R1ZGVudCB3aXRoIHRoZSBsZWFzdCB0aW1lIGxlZnRcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGNob3NlblN0dWRlbnQgPSBzdHVkZW50c0luVGhpc1Rlcm0uT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSBtaW51dGUpKS5GaXJzdE9yRGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvc2VuU3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFVzZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RyaW5nIG5hbWU7XHJcbiAgICAgICAgcHVibGljIGJvb2xbXSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWRNaW51dGVzID0gLTE7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZERheSA9IC0xO1xyXG4gICAgICAgIHB1YmxpYyBib29sIGFzc2lnbmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHB1YmxpYyBVc2VyKHN0cmluZyBuYW1lLCBib29sW10gZGF5c0F2YWlsYWJsZSwgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGUsIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGF5c0F2YWlsYWJsZSA9IGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb21BdmFpbGFibGUgPSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzVG9BdmFpbGFibGUgPSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldEhvdXJzSW5EYXkoaW50IGRheUluZGV4KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRheUluZGV4IDwgMCB8fCBkYXlJbmRleCA+PSA1KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXhjZXB0aW9uKFwiUGFyYW1ldGVyIE1VU1QgQkUgaW4gcmFuZ2UgWzA7IDUpLiBWYWx1ZTogXCIgKyBkYXlJbmRleCwgXCJkYXlJbmRleFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF5c0F2YWlsYWJsZVtkYXlJbmRleF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIjtcclxuXHJcbiAgICAgICAgICAgIGludCBtaW51dGVzRiA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUluZGV4XTtcclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNUID0gbWludXRlc1RvQXZhaWxhYmxlW2RheUluZGV4XTtcclxuXHJcbiAgICAgICAgICAgIGludCBob3Vyc0YgPSAoaW50KU1hdGguRmxvb3IobWludXRlc0YgLyA2MGQpO1xyXG4gICAgICAgICAgICBpbnQgaG91cnNUID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNUIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiT2QgezB9OnsxfSBkbyB7Mn06ezN9XCIsaG91cnNGLChtaW51dGVzRiAtIGhvdXJzRiAqIDYwKS5Ub1N0cmluZyhcIiMjI1wiKSxob3Vyc1QsKG1pbnV0ZXNUIC0gaG91cnNUICogNjApLlRvU3RyaW5nKFwiIyNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==

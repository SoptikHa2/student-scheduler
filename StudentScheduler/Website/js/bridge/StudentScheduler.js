/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 16.5.0
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
                lessonLength: 0
            },
            ctors: {
                init: function () {
                    this.lessonLength = 50;
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



                return null;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.User", {
        fields: {
            name: null,
            daysAvailable: null,
            minutesFromAvailable: null,
            minutesToAvailable: null,
            assignedConvertedMinutesFrom: 0
        },
        ctors: {
            ctor: function (name, daysAvailable, minutesFromAvailable, minutesToAvailable) {
                this.$initialize();
                this.name = name;
                this.daysAvailable = daysAvailable;
                this.minutesFromAvailable = minutesFromAvailable;
                this.minutesToAvailable = minutesToAvailable;
                this.assignedConvertedMinutesFrom = -1;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O1lBd0JZQSw0QkFBT0EsSUFBSUE7OztZQUdYQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7O1lBQ2hEQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7OztZQUVoREEsV0FBV0E7WUFDWEEsS0FBS0EsV0FBV0EsSUFBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsR0FBTEEsMkRBQUtBLEdBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsR0FBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUM3QkEsd0JBQUtBLElBQUxBLDJEQUFLQSxJQUFMQSxnQkFBbUJBLFVBQUNBO29CQUFRQSxvQ0FBZUEsd0JBQUtBLElBQUxBOzs7O1lBRS9DQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkE7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLHdCQUFLQSxLQUFMQTs7OztZQUV0REEscURBQWdDQSxVQUFDQTtnQkFBUUE7Z0JBQWtCQTs7O1lBRTNEQSw0REFBdUNBLFVBQUNBO2dCQUFRQTtnQkFBbUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBR3JDQTs7b0JBRzlCQSxZQUF5QkEsQ0FBQ0Esc0NBQStEQSwyRkFBb0ZBLEFBQThEQTttQ0FBS0EsNkJBQVFBOztvQkFDeFBBLHFCQUF3QkE7b0JBQ3hCQSxJQUFJQTt3QkFDQUE7OztvQkFFSkEs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aUJBQUtBLGlFQUN0R0EsK0NBQXlCQSwwQkFBV0EseUVBQWdDQSw0QkFBY0EsOENBQXlCQSwwQkFBV0EsdUVBQThCQTs7O29EQU01SUE7b0JBRTNDQSxZQUFZQSxrQkFBS0EsV0FBV0E7b0JBQzVCQSxVQUFhQSxnSEFBMEZBO29CQUN2R0EsT0FBT0EsZUFBTUEsK0dBQTBGQSxDQUFDQSxZQUFVQTs7cUhBR05BO29CQUU1R0EsVUFBYUE7b0JBQ2JBLElBQUlBO3dCQUNBQSxNQUFNQSxPQUFNQTs7b0JBQ2hCQSxPQUFPQTs7K0JBR29CQTtvQkFBWUEsT0FBT0Esd0JBQXdCQTs7K0JBQ3pDQTtvQkFBYUEsT0FBT0EsNEJBQWlFQSxxQ0FBcUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JDMU12SkEsZ0JBQVdBLEtBQUlBO2dCQUNmQSxnQkFBV0EsS0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQThCZkEsT0FBT0E7Ozs7Ozs7Ozs7Ozs7OzRCQ2pDQ0EsTUFBYUEsZUFBc0JBLHNCQUE0QkE7O2dCQUV2RUEsWUFBWUE7Z0JBQ1pBLHFCQUFxQkE7Z0JBQ3JCQSw0QkFBNEJBO2dCQUM1QkEsMEJBQTBCQTtnQkFDMUJBLG9DQUErQkE7Ozs7cUNBR1BBO2dCQUV4QkEsSUFBSUEsZ0JBQWdCQTtvQkFDaEJBLE1BQU1BLElBQUlBLHlCQUFrQkEsK0NBQStDQTs7O2dCQUUvRUEsSUFBSUEsQ0FBQ0Esc0NBQWNBLFVBQWRBO29CQUNEQTs7O2dCQUVKQSxlQUFlQSw2Q0FBcUJBLFVBQXJCQTtnQkFDZkEsZUFBZUEsMkNBQW1CQSxVQUFuQkE7O2dCQUVmQSxhQUFhQSxrQkFBS0EsV0FBV0E7Z0JBQzdCQSxhQUFhQSxrQkFBS0EsV0FBV0E7O2dCQUU3QkEsT0FBT0EsOENBQXNDQSxrQ0FBT0EscUJBQUNBLGFBQVdBLDJDQUE2QkEsa0NBQU9BLHFCQUFDQSxhQUFXQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBQbGFuIHBsYW47XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBsYXN0U2V0V2FzVGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNldElkO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2VsZWN0ZWREYXk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGRheUlkO1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmdbXSBkYXlzID0geyBcIm1vbmRheVwiLCBcInR1ZXNkYXlcIiwgXCJ3ZWRuZXNkYXlcIiwgXCJ0aHVyc2RheVwiLCBcImZyaWRheVwiIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiBsb2FkP1xyXG4gICAgICAgICAgICBwbGFuID0gbmV3IFBsYW4oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGNhbGxiYWNrc1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3VGVhY2hlciA9IEdpZChcImFkZC10ZWFjaGVyXCIpO1xyXG4gICAgICAgICAgICBidXROZXdUZWFjaGVyLk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3VGVhY2hlcihidXROZXdUZWFjaGVyKTsgfTtcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1N0dWRlbnQgPSBHaWQoXCJhZGQtc3R1ZGVudFwiKTtcclxuICAgICAgICAgICAgYnV0TmV3U3R1ZGVudC5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1N0dWRlbnQoYnV0TmV3U3R1ZGVudCk7IH07XHJcblxyXG4gICAgICAgICAgICB2YXIgYnV0cyA9IEdjbChcInRlYWNoZXItY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCB0cnVlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJzdHVkZW50LWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgZmFsc2UpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcImJ1dC10aW1lLXNldFwiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgYyA9IGk7XHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgU29tZURheUVkaXRIb3Vyc0NsaWNrKGJ1dHNbY10pOyB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWhvdXJzXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBTYXZlSG91ckNoYW5nZSgpOyBVcGRhdGVMaXN0T2ZEYXlzKCk7IH07XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vycy1jYW5jZWxcIikuT25DbGljayA9IChlKSA9PiB7IFJlbW92ZUhvdXJJbkRheSgpOyBVcGRhdGVMaXN0T2ZEYXlzKCk7IH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgaW50IGZyb20gPSAoaW50KSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyICogNjAgKyAoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuICAgICAgICAgICAgaW50IHRvID0gKGludCkoKEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIgKiA2MCArIChHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmcm9tICsgUGxhbi5sZXNzb25MZW5ndGggPiB0bylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IHRvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZW1vdmVIb3VySW5EYXkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgVXBkYXRlTGlzdE9mRGF5cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdG8gYWxsIGRheXM6IGlmIHRoZXJlIGlzIGF0IGxlYXN0IHtQbGFuLmxlc3Nvbkxlbmd0aH0gKDUwKSBtaW51dGVzIGJldHdlZW4gdHdvIHRpbWVzOiByZXR1cm4gdGltZXMgaW4gZm9ybWF0IFtcIkhIOk1NIC0gSEg6TU1cIl0sIGVsc2UsIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgNTsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1cIiArIGRheXNbaV0pLklubmVySFRNTCA9IGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbaV0gLSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0gPCBQbGFuLmxlc3Nvbkxlbmd0aCA/IFwiTmVuw60gbmFzdGF2ZW5vXCIgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0pICsgXCIgLSBcIiArIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmcgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGludCBtaW51dGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGhvdXJzID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXMgLyA2MGQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgcmV0ID0gTXlOdW1iZXJUb1N0cmluZ1dpdGhBdExlYXN0VHdvRGlnaXRzRm9ybWF0QmVjYXVzZUJyaWRnZURvdE5ldENhbm5vdERvVGhhdFNpbXBsZVRhc2tJdHNlbGYoaG91cnMpICsgXCI6XCI7XHJcbiAgICAgICAgICAgIHJldHVybiByZXQgKyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXRCZWNhdXNlQnJpZGdlRG90TmV0Q2Fubm90RG9UaGF0U2ltcGxlVGFza0l0c2VsZigobWludXRlcyAtIGhvdXJzICogNjApKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXRCZWNhdXNlQnJpZGdlRG90TmV0Q2Fubm90RG9UaGF0U2ltcGxlVGFza0l0c2VsZihpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG51bSA9IG51bWJlci5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAobnVtLkxlbmd0aCA9PSAxKVxyXG4gICAgICAgICAgICAgICAgbnVtID0gXCIwXCIgKyBudW07XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudCBHaWQoc3RyaW5nIGlkKSB7cmV0dXJuIERvY3VtZW50LkdldEVsZW1lbnRCeUlkKGlkKTt9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnRbXSBHY2woc3RyaW5nIGNscykge3JldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvQXJyYXk8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpKTt9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBsZXNzb25MZW5ndGggPSA1MDsgLy8gNDUgKyA1IHBhdXNlXHJcblxyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOT1RFOiBJIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEhPVyBUSElTIFdPUktTOlxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIDEuMCkgU2V0IHN0YXJ0IHRpbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUgb2YgdGhlIGRheVxyXG4gICAgICAgICAgICAvLyAxLjEpIEZpbmQgc3R1ZGVudCB3aG8gaGFzIHN0YXJ0aW5nIHRpbWUgdGhlIHNhbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUuIElmIHllcywgcG9zIGFuZCByZXBlYXQgMSkgNDUgbWludXRlcyBsYXRlci5cclxuICAgICAgICAgICAgLy8gICAgICBJZiBub3QsIG1vdmUgYnkgNSBtaW51dGVzIGFuZCB0cnkgaXQgYWdhaW4gd2l0aCBhbGwgc3R1ZGVudHMuIElmIGhpdCB0ZWFjaGVyJ3MgZW5kIHRpbWUsIG1vdmUgdG8gbmV4dCBkYXlcclxuXHJcbiAgICAgICAgICAgIC8vIE9QVElNQUxJWkFUSU9OOiBDaGVjayBpZiBib3RoIHRlYWNoZXIgYW5kIHN0dWRlbnRzIGhhdmUgc29tZSBtaW51dGVzIGluIGNvbW1vbi4gSWYgbm90LCBza2lwIHRoaXMgZGF5XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhbGwgc3R1ZGVudHMgYXJlIHBvc2l0aW9uZWQsIGVuZC4gSWYgbm90LCBoZWFkIHRvIHN0ZXAgMlxyXG5cclxuICAgICAgICAgICAgLy8gMi4wKSBJIGhhdmUgc29tZSBzdHVkZW50cyB3aXRob3V0IGFzc2lnbmVkIGhvdXJzLiBQaWNrIHN0dWRlbnQgd2l0aCBsZWFzdCBwb3NzaWJsZSBob3Vycy4gRmluZCBhbGxcclxuICAgICAgICAgICAgLy8gICAgICBob3VycyB3aGVyZSBJIGNhbiBwb3MgdGhpcyBzdHVkZW50IGluIGFsbCBkYXlzLlxyXG4gICAgICAgICAgICAvLyAyLjEpIENob29zZSB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGxlYXN0IHVuYXNzaWduZWQgc3R1ZGVudHMgY2FuIGdvLiBBZnRlciB0aGF0LCBjaG9vc2UgcG9zaXRpb24gd2hlcmVcclxuICAgICAgICAgICAgLy8gICAgICBpcyBzdHVkZW50IHdpdGggbW9zdCBmcmVlIHRpbWVcclxuICAgICAgICAgICAgLy8gMi4yKSBTd2FwIHRob3NlIHN0dWRlbnRzXHJcbiAgICAgICAgICAgIC8vIDIuMykgUmVwZWF0LiBJZiBhbHJlYWR5IHJlcGVhdGVkIE4gdGltZXMsIHdoZXJlIE4gaXMgbnVtYmVyIG9mIHVuYXNzaWduZWQgc3R1ZGVudHMgYXQgdGhlIGJlZ2dpbmluZyBvZiBwaGFzZSAyLFxyXG4gICAgICAgICAgICAvLyAgICAgIGVuZCwgc2hvdyBhbGwgcG9zaXRpb25lZCBzdHVkZW50cyBhbmQgcmVwb3J0IGZhaWx1cmVcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIGNsYXNzIFVzZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RyaW5nIG5hbWU7XHJcbiAgICAgICAgcHVibGljIGJvb2xbXSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWRDb252ZXJ0ZWRNaW51dGVzRnJvbTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgYXNzaWduZWRDb252ZXJ0ZWRNaW51dGVzRnJvbSA9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZXRIb3Vyc0luRGF5KGludCBkYXlJbmRleClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkYXlJbmRleCA8IDAgfHwgZGF5SW5kZXggPj0gNSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudEV4Y2VwdGlvbihcIlBhcmFtZXRlciBNVVNUIEJFIGluIHJhbmdlIFswOyA1KS4gVmFsdWU6IFwiICsgZGF5SW5kZXgsIFwiZGF5SW5kZXhcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRheXNBdmFpbGFibGVbZGF5SW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCI7XHJcblxyXG4gICAgICAgICAgICBpbnQgbWludXRlc0YgPSBtaW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJbmRleF07XHJcbiAgICAgICAgICAgIGludCBtaW51dGVzVCA9IG1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJbmRleF07XHJcblxyXG4gICAgICAgICAgICBpbnQgaG91cnNGID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNGIC8gNjBkKTtcclxuICAgICAgICAgICAgaW50IGhvdXJzVCA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzVCAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIk9kIHswfTp7MX0gZG8gezJ9OnszfVwiLGhvdXJzRiwobWludXRlc0YgLSBob3Vyc0YgKiA2MCkuVG9TdHJpbmcoXCIjIyNcIiksaG91cnNULChtaW51dGVzVCAtIGhvdXJzVCAqIDYwKS5Ub1N0cmluZyhcIiMjXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=

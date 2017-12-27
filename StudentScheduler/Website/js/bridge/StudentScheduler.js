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
            };

            StudentScheduler.App.Gid("set-time-hours-cancel").onclick = function (e) {
                StudentScheduler.App.RemoveHourInDay();
            };
        },
        statics: {
            fields: {
                plan: null,
                lastSetWasTeacher: false,
                lastSetId: 0,
                lastSelectedDay: 0,
                dayId: 0
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

                    if (((from + 45) | 0) > to) {
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
                throw new System.NotImplementedException();
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.User", {
        statics: {
            fields: {
                hourLength: 0
            },
            ctors: {
                init: function () {
                    this.hourLength = 45;
                }
            }
        },
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O1lBc0JZQSw0QkFBT0EsSUFBSUE7OztZQUdYQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7O1lBQ2hEQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7OztZQUVoREEsV0FBV0E7WUFDWEEsS0FBS0EsV0FBV0EsSUFBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsR0FBTEEsMkRBQUtBLEdBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsR0FBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUM3QkEsd0JBQUtBLElBQUxBLDJEQUFLQSxJQUFMQSxnQkFBbUJBLFVBQUNBO29CQUFRQSxvQ0FBZUEsd0JBQUtBLElBQUxBOzs7O1lBRS9DQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkE7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLHdCQUFLQSxLQUFMQTs7OztZQUV0REEscURBQWdDQSxVQUFDQTtnQkFBUUE7OztZQUV6Q0EsNERBQXVDQSxVQUFDQTtnQkFBUUE7Ozs7Ozs7Ozs7Ozt5Q0FHbEJBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JB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OztnQkFFdkVBLFlBQVlBO2dCQUNaQSxxQkFBcUJBO2dCQUNyQkEsNEJBQTRCQTtnQkFDNUJBLDBCQUEwQkE7Z0JBQzFCQSxvQ0FBK0JBOzs7O3FDQUdQQTtnQkFFeEJBLElBQUlBLGdCQUFnQkE7b0JBQ2hCQSxNQUFNQSxJQUFJQSx5QkFBa0JBLCtDQUErQ0E7OztnQkFFL0VBLElBQUlBLENBQUNBLHNDQUFjQSxVQUFkQTtvQkFDREE7OztnQkFFSkEsZUFBZUEsNkNBQXFCQSxVQUFyQkE7Z0JBQ2ZBLGVBQWVBLDJDQUFtQkEsVUFBbkJBOztnQkFFZkEsYUFBYUEsa0JBQUtBLFdBQVdBO2dCQUM3QkEsYUFBYUEsa0JBQUtBLFdBQVdBOztnQkFFN0JBLE9BQU9BLDhDQUFzQ0Esa0NBQU9BLHFCQUFDQSxhQUFXQSwyQ0FBNkJBLGtDQUFPQSxxQkFBQ0EsYUFBV0EiLAogICJzb3VyY2VzQ29udGVudCI6IFsidXNpbmcgQnJpZGdlO1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcbnVzaW5nIE5ld3RvbnNvZnQuSnNvbjtcclxudXNpbmcgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYztcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlclxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQXBwXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUGxhbiBwbGFuO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgbGFzdFNldFdhc1RlYWNoZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZXRJZDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNlbGVjdGVkRGF5O1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBkYXlJZDtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXRzID0gR2NsKFwidGVhY2hlci1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIHRydWUpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcInN0dWRlbnQtY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCBmYWxzZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwiYnV0LXRpbWUtc2V0XCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBjID0gaTtcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBTb21lRGF5RWRpdEhvdXJzQ2xpY2soYnV0c1tjXSk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnNcIikuT25DbGljayA9IChlKSA9PiB7IFNhdmVIb3VyQ2hhbmdlKCk7IH07XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vycy1jYW5jZWxcIikuT25DbGljayA9IChlKSA9PiB7IFJlbW92ZUhvdXJJbkRheSgpOyB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdUZWFjaGVyKEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJ0ZWFjaGVyLW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3VGVhY2hlck5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1RlYWNoZXJOYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihuZXdUZWFjaGVyTmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwidGVhY2hlcnNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdUZWFjaGVyTmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4udGVhY2hlcnMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIHRydWUpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdTdHVkZW50KEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJzdHVkZW50LW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3U3R1ZGVudE5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1N0dWRlbnROYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihuZXdTdHVkZW50TmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwic3R1ZGVudHNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdTdHVkZW50TmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4udGVhY2hlcnMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIHRydWUpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgaW50IGZyb20gPSAoaW50KSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyICogNjAgKyAoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuICAgICAgICAgICAgaW50IHRvID0gKGludCkoKEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIgKiA2MCArIChHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmcm9tICsgNDUgPiB0bylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IHRvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZW1vdmVIb3VySW5EYXkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudCBHaWQoc3RyaW5nIGlkKSB7cmV0dXJuIERvY3VtZW50LkdldEVsZW1lbnRCeUlkKGlkKTt9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnRbXSBHY2woc3RyaW5nIGNscykge3JldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvQXJyYXk8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpKTt9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEV4Y2VwdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBVc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBob3VyTGVuZ3RoID0gNDU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZENvbnZlcnRlZE1pbnV0ZXNGcm9tO1xyXG5cclxuICAgICAgICBwdWJsaWMgVXNlcihzdHJpbmcgbmFtZSwgYm9vbFtdIGRheXNBdmFpbGFibGUsIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmRheXNBdmFpbGFibGUgPSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNGcm9tQXZhaWxhYmxlID0gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc1RvQXZhaWxhYmxlID0gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICBhc3NpZ25lZENvbnZlcnRlZE1pbnV0ZXNGcm9tID0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldEhvdXJzSW5EYXkoaW50IGRheUluZGV4KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRheUluZGV4IDwgMCB8fCBkYXlJbmRleCA+PSA1KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXhjZXB0aW9uKFwiUGFyYW1ldGVyIE1VU1QgQkUgaW4gcmFuZ2UgWzA7IDUpLiBWYWx1ZTogXCIgKyBkYXlJbmRleCwgXCJkYXlJbmRleFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF5c0F2YWlsYWJsZVtkYXlJbmRleF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIjtcclxuXHJcbiAgICAgICAgICAgIGludCBtaW51dGVzRiA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUluZGV4XTtcclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNUID0gbWludXRlc1RvQXZhaWxhYmxlW2RheUluZGV4XTtcclxuXHJcbiAgICAgICAgICAgIGludCBob3Vyc0YgPSAoaW50KU1hdGguRmxvb3IobWludXRlc0YgLyA2MGQpO1xyXG4gICAgICAgICAgICBpbnQgaG91cnNUID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNUIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiT2QgezB9OnsxfSBkbyB7Mn06ezN9XCIsaG91cnNGLChtaW51dGVzRiAtIGhvdXJzRiAqIDYwKS5Ub1N0cmluZyhcIiMjI1wiKSxob3Vyc1QsKG1pbnV0ZXNUIC0gaG91cnNUICogNjApLlRvU3RyaW5nKFwiIyNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==

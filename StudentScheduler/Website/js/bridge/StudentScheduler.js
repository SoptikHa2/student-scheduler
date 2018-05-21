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
                buts[i].onclick = Bridge.fn.combine(buts[i].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[i], true);
                });
            }

            buts = StudentScheduler.App.Gcl("student-click");
            for (var i1 = 0; i1 < buts.length; i1 = (i1 + 1) | 0) {
                buts[i1].onclick = Bridge.fn.combine(buts[i1].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[i1], false);
                });
            }

            buts = StudentScheduler.App.Gcl("but-time-set");
            for (var i2 = 0; i2 < buts.length; i2 = (i2 + 1) | 0) {
                var c = { v : i2 };
                buts[i2].onclick = Bridge.fn.combine(buts[i2].onclick, (function ($me, c) {
                    return function (e) {
                        StudentScheduler.App.SomeDayEditHoursClick(buts[c.v]);
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
                /* plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, true, false, false }, new int[] { 12 * 60, 0, 14 * 60, 0, 0 }, new int[] { 20 * 60, 0, 19 * 60, 0, 0 }));

                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 15 * 60, 0, 0, 0, 0 }, new int[] { 16 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 11 * 60, 0, 0, 0, 0 }, new int[] {18 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 3", new bool[] { true, false, false, false, false }, new int[] { 12 * 60, 0, 0, 0, 0 }, new int[] { 14 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 4", new bool[] { true, false, false, false, false }, new int[] { 0, 0, 0, 0, 0 }, new int[] { 23 * 60 + 59, 0, 0, 0, 0 }));
                */

                StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User("Test Teacher", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([600, 0, 0, 0, 0], System.Int32), System.Array.init([720, 0, 0, 0, 0], System.Int32)));

                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 2", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([600, 0, 0, 0, 0], System.Int32), System.Array.init([720, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 1", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([610, 0, 0, 0, 0], System.Int32), System.Array.init([710, 0, 0, 0, 0], System.Int32)));

                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };

            StudentScheduler.Log.InitializeWithDiv(Bridge.as(StudentScheduler.App.Gid("logDiv"), HTMLDivElement));
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
                    return document.body.getElementsByClassName(cls);
                }
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.BruteForcedStudent", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.BruteForcedStudent(); }
            }
        },
        fields: {
            minutesFrom: 0,
            student: null
        },
        ctors: {
            $ctor1: function (minutesFrom, student) {
                this.$initialize();
                this.minutesFrom = minutesFrom;
                this.student = student;
            },
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([6973949932, this.minutesFrom, this.student]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.BruteForcedStudent)) {
                    return false;
                }
                return Bridge.equals(this.minutesFrom, o.minutesFrom) && Bridge.equals(this.student, o.student);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.BruteForcedStudent();
                s.minutesFrom = this.minutesFrom;
                s.student = this.student;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Edge", {
        fields: {
            Capacity: 0,
            currentFlow: 0,
            From: null,
            To: null
        },
        ctors: {
            ctor: function (capacity, currentFlow, from, to) {
                this.$initialize();
                this.Capacity = capacity;
                this.currentFlow = currentFlow;
                this.From = from;
                this.To = to;
            }
        },
        methods: {
            GetCurrentFlow: function (currentPath, flow, info) {
                return this.currentFlow;
            },
            SetCurrentFlow: function (newValue) {
                this.currentFlow = newValue;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow", {
        fields: {
            Nodes: null,
            teacher: null,
            students: null
        },
        ctors: {
            ctor: function (teacher, students) {
                this.$initialize();
                this.teacher = teacher;
                this.students = students;
                this.Nodes = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
            }
        },
        methods: {
            /**
             * Gets result using flows. This method will set student assigned times and return array of minutes, when is break time each day
             *
             * @instance
             * @public
             * @this StudentScheduler.AppLogic.NetworkFlow.Flow
             * @memberof StudentScheduler.AppLogic.NetworkFlow.Flow
             * @return  {Array.<number>}
             */
            GetResult: function () {
                var $t;
                var breaks = System.Array.init(5, 0, System.Int32);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    StudentScheduler.Log.Write(System.String.format("===================DAY: {0}==============", [Bridge.box(day, System.Int32)]), StudentScheduler.Log.Severity.Info);
                    this.BuildGraph(day);
                    this.Start();
                    StudentScheduler.Log.Write("Done...", StudentScheduler.Log.Severity.Info);
                    var studentsToday = this.GetResultFromGraph(day);
                    // If there are more then three students today:
                    if (studentsToday.Count > 3) {
                        // Save first three student times
                        for (var i = 0; i < 3; i = (i + 1) | 0) {
                            this.ApplyStudent(studentsToday.getItem(i).$clone());
                        }
                        // Disable minutes and record break time
                        breaks[System.Array.index(day, breaks)] = (studentsToday.getItem(2).$clone().timeStart + 50) | 0;
                        // Start again (remove first two students and their times)
                        this.BuildGraph(day, breaks[System.Array.index(day, breaks)], ((breaks[System.Array.index(day, breaks)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0));
                        this.Start();
                        studentsToday = this.GetResultFromGraph(day);
                    } else {
                        breaks[System.Array.index(day, breaks)] = 2147483647;
                    }

                    // Apply all students
                    $t = Bridge.getEnumerator(studentsToday);
                    try {
                        while ($t.moveNext()) {
                            var result = $t.Current.$clone();
                            this.ApplyStudent(result.$clone());
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                StudentScheduler.Log.Write("Break: " + (Bridge.toArray(breaks).join(", ") || ""), StudentScheduler.Log.Severity.Info);

                return breaks;
            },
            BuildGraph: function (day, bannedTimespanFrom, bannedTimespanTo) {
                var $t, $t1, $t2, $t3;
                if (bannedTimespanFrom === void 0) { bannedTimespanFrom = -1; }
                if (bannedTimespanTo === void 0) { bannedTimespanTo = -1; }
                this.Nodes.clear();
                // Add root node
                var root = new StudentScheduler.AppLogic.NetworkFlow.Node("Input", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Input);
                this.Nodes.add(root);

                // Add all students nodes
                $t = Bridge.getEnumerator(this.students);
                try {
                    while ($t.moveNext()) {
                        var student = $t.Current;
                        if (student.assigned || !student.daysAvailable[System.Array.index(day, student.daysAvailable)]) {
                            continue;
                        }

                        // TODO: Error when multiple students with same name
                        var studentNode = new StudentScheduler.AppLogic.NetworkFlow.Node("Student:" + (student.name || ""), -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);
                        this.AddNodeAfter("Input", studentNode);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                // Prepare time chunk node
                var timeChunk = new StudentScheduler.AppLogic.NetworkFlow.Node("TimeChunk", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);

                var occupiedTimesToday = System.Linq.Enumerable.from(this.students).where(function (student1) {
                        return student1.assignedDay === day;
                    }).select(function (student1) {
                    return student1.assignedMinutes;
                });

                // Add all times nodes
                for (var time = 0; time < 1440; time = (time + 5) | 0) {
                    // If the time is banned or someone already positioned used the time, skip to next time
                    if ((time >= bannedTimespanFrom && time <= bannedTimespanTo) || occupiedTimesToday.where(function (occTime) {
                        return Math.abs(((occTime - time) | 0)) < 50;
                    }).count() > 0) {
                        continue;
                    }

                    if (($t1 = this.teacher.minutesFromAvailable)[System.Array.index(day, $t1)] <= time && ((($t2 = this.teacher.minutesToAvailable)[System.Array.index(day, $t2)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0) >= time) {

                        var studentsAtThisTime = System.Linq.Enumerable.from(this.students).where(function (student1) {
                                return !student1.assigned && student1.daysAvailable[System.Array.index(day, student1.daysAvailable)] && student1.minutesFromAvailable[System.Array.index(day, student1.minutesFromAvailable)] <= time && ((student1.minutesToAvailable[System.Array.index(day, student1.minutesToAvailable)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0) >= time;
                            });

                        var timeNode = new StudentScheduler.AppLogic.NetworkFlow.Node("Time:" + time, time, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);
                        $t3 = Bridge.getEnumerator(studentsAtThisTime);
                        try {
                            while ($t3.moveNext()) {
                                var student1 = $t3.Current;
                                this.AddNodeAfter("Student:" + (student1.name || ""), timeNode);
                            }
                        } finally {
                            if (Bridge.is($t3, System.IDisposable)) {
                                $t3.System$IDisposable$dispose();
                            }
                        }this.AddNodeAfter("Time:" + time, timeChunk);
                    }
                }

                // Connect Time Chunk with output
                var output = new StudentScheduler.AppLogic.NetworkFlow.Node("Output", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Output);
                this.AddNodeAfter("TimeChunk", output);

                // Change edge between TimeChunk(Node) and Output to TimeChunk(Edge)
                var timeChunkEdge = new StudentScheduler.AppLogic.NetworkFlow.TimeChunk(timeChunk, output);
                timeChunk.OutputEdges.clear();
                timeChunk.OutputEdges.add(timeChunkEdge);
                output.InputEdges.clear();
                output.InputEdges.add(timeChunkEdge);
            },
            AddNodeAfter: function (identifier, newNode) {
                var $t;
                $t = Bridge.getEnumerator(this.Nodes);
                try {
                    while ($t.moveNext()) {
                        var node = $t.Current;
                        if (Bridge.referenceEquals(node.Identifier, identifier)) {
                            var newEdge = new StudentScheduler.AppLogic.NetworkFlow.Edge(1, 0, node, newNode);
                            node.OutputEdges.add(newEdge);
                            newNode.InputEdges.add(newEdge);
                            break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (!this.Nodes.contains(newNode)) {
                    this.Nodes.add(newNode);
                }
            },
            Start: function () {
                // While we are creating new flow, keep doing it
                while (this.CreateNewFlow()) {
                    ;
                }
            },
            CreateNewFlow: function () {
                var $t, $t1, $t2;
                // Let's create dictionary of Node : SourceNode
                //  +----+----+----+-----+-----+
                //  | A1 | A2 | B1 | TCH | OUT | 
                //  +----+----+----+-----+-----+
                //  | I  | I  | A1 | B1  | TCH |
                //  +----+----+----+-----+-----+

                var FlowPath = new (System.Collections.Generic.Dictionary$2(StudentScheduler.AppLogic.NetworkFlow.Node, StudentScheduler.AppLogic.NetworkFlow.Node))();
                for (var i = 1; i < this.Nodes.Count; i = (i + 1) | 0) {
                    FlowPath.add(this.Nodes.getItem(i), null);
                } // Add all nodes into FlowPath !except for root node

                var NodesToProcess = new (System.Collections.Generic.Queue$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                NodesToProcess.enqueue(this.Nodes.getItem(0)); // Mark root node as to-process

                var AlreadyAddedNodes = new (System.Collections.Generic.HashSet$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                AlreadyAddedNodes.add(this.Nodes.getItem(0));
                while (NodesToProcess.Count > 0) {
                    // Get all nodes that still have avaiable flow space in them and aren't occupied (in FlowPath)
                    var node = NodesToProcess.dequeue();

                    // Nodes that are accessable from this node
                    var avaiableNodes = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).$ctor2(((node.OutputEdges.Count + node.InputEdges.Count) | 0));

                    var doInputEdges = true;
                    var areInputEdgesForbidden = false;
                    var renderedPath = this.RenderPath(System.Linq.Enumerable.from(this.Nodes).first(), node, FlowPath);
                    $t = Bridge.getEnumerator(node.OutputEdges);
                    try {
                        while ($t.moveNext()) {
                            var outputEdge = $t.Current;
                            var flow = outputEdge.GetCurrentFlow(renderedPath, this, "OutputEdges");
                            if (flow > 1) {
                                areInputEdgesForbidden = true;
                            }
                            if (flow === 0) {
                                avaiableNodes.add(outputEdge.To);
                                doInputEdges = false;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }if (doInputEdges && !areInputEdgesForbidden) {
                        $t1 = Bridge.getEnumerator(node.InputEdges);
                        try {
                            while ($t1.moveNext()) {
                                var inputEdge = $t1.Current;
                                // RESENI: Tohle budu prochazet, JENOM kdyz nenajdu zadnou cestu pomoci OutputEdge //TODO: Mozne nefunkcni pro neco?
                                // Budu hledat cestu JENOM mezi hranami grafu, do kterych MUZE ten student, ktery ma cestu, kterou mu kradu; jit.

                                // Sem se dostanu jenom v pripade, ze vsechny OutputNody z TimeChunku(Node) jsou odmitnuty -> [node] je vzdy TimeChunk

                                StudentScheduler.Log.Write((node.Identifier || "") + " (" + node.Value + ")", StudentScheduler.Log.Severity.Critical);



                                if (Bridge.is(inputEdge, StudentScheduler.AppLogic.NetworkFlow.TimeChunk)) {
                                    StudentScheduler.Log.Write("I found input edge that was Time Chunk; from = " + (inputEdge.To.Identifier || ""), StudentScheduler.Log.Severity.Warning);
                                }

                                // Why?
                                if (renderedPath.Count >= 2 && Bridge.referenceEquals(inputEdge.From, renderedPath.getItem(((renderedPath.Count - 2) | 0)))) {
                                    continue;
                                }

                                var flow1 = inputEdge.GetCurrentFlow(renderedPath, this, "InputEdges");
                                if (flow1 === 1) {
                                    avaiableNodes.add(inputEdge.From);
                                    StudentScheduler.Log.Write("I just used backflow. Here's full path: " + (Bridge.toArray(System.Linq.Enumerable.from(renderedPath).select(function (n) {
                                                return System.String.format("\"{0}\"({1})", n.Identifier, Bridge.box(n.Value, System.Int32));
                                            })).join(" , ") || "") + ". The new node is \"" + (inputEdge.From.Identifier || "") + "\"(" + inputEdge.From.Value + ")", StudentScheduler.Log.Severity.Critical);
                                }


                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }}

                    // Fill all nodes that are accessible from this node
                    $t2 = Bridge.getEnumerator(avaiableNodes);
                    try {
                        while ($t2.moveNext()) {
                            var nodeToGoThrough = $t2.Current;
                            if (AlreadyAddedNodes.contains(nodeToGoThrough)) {
                                continue;
                            }

                            AlreadyAddedNodes.add(nodeToGoThrough);
                            FlowPath.set(nodeToGoThrough, node);
                            NodesToProcess.enqueue(nodeToGoThrough);
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$dispose();
                        }
                    }}

                // Now, I (probably) have flow
                StudentScheduler.Log.Write(this.toString(), StudentScheduler.Log.Severity.Info);
                this.DEBUG_WriteFlowPath(FlowPath);
                var TimeChunk = System.Linq.Enumerable.from(FlowPath.getKeys()).where(function (x) {
                        return Bridge.referenceEquals(x.Identifier, "TimeChunk");
                    }).singleOrDefault(null, null);
                if (TimeChunk == null || FlowPath.get(TimeChunk) == null) {
                    StudentScheduler.Log.Write("No flow", StudentScheduler.Log.Severity.Info);
                    // No flow
                    return false;
                } else {
                    StudentScheduler.Log.Write("Applying flow", StudentScheduler.Log.Severity.Info);
                    this.ApplyFlow(System.Linq.Enumerable.from(this.Nodes).first(), TimeChunk, FlowPath);
                    return true;
                }

                /* // First of all, we have to create the dictionary, so we know, what the path is
                Dictionary<Node, Node> FlowPath = new Dictionary<Node, Node>();
                // Populate the dictionary with nodes
                foreach (Node node in Nodes) FlowPath.Add(node, null);

                // Here, we create Queue, that holds nodes, that we will want to work with
                // Plus list of nodes which were already added to Queue, so we don't process one node multiple times
                Queue<Node> nodesToProcess = new Queue<Node>();
                // And let's enqueue root node
                nodesToProcess.Enqueue(Nodes[0]);
                // Here's the list of added nodes
                HashSet<Node> alreadyAddedNodes = new HashSet<Node>();
                // And add the root node
                alreadyAddedNodes.Add(Nodes[0]);

                // Now we build the flow: */
            },
            DEBUG_WriteFlowPath: function (FlowPath) {
                var output = "Keys: " + (Bridge.toArray(System.Linq.Enumerable.from(FlowPath.getKeys()).select(function (x) {
                            return x.Identifier;
                        })).join(" | ") || "");
                output = (output || "") + "\n";
                output = (output || "") + (("Values: " + (Bridge.toArray(System.Linq.Enumerable.from(FlowPath.getValues()).select(function (x) {
                            return x == null ? "---" : x.Identifier;
                        })).join(" | ") || "")) || "");
                StudentScheduler.Log.Write(output, StudentScheduler.Log.Severity.Info);
            },
            RenderPath: function (rootNode, endNode, flowPath) {
                var path = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                path.add(endNode);

                var nextNode = endNode;
                while (!Bridge.referenceEquals(nextNode, rootNode)) {
                    nextNode = flowPath.get(nextNode);
                    path.add(nextNode);
                }

                path.reverse();
                return path;
            },
            GetResultFromGraph: function (day) {
                StudentScheduler.Log.Write("Starting GetResultFromGraph", StudentScheduler.Log.Severity.Info);

                var timeNodes = System.Linq.Enumerable.from(this.Nodes).where(function (node) {
                        return node.Value !== -1;
                    });

                var usedTimeNodes = timeNodes.where(function (node) {
                    return node.InputEdges.Count !== 0;
                });

                StudentScheduler.Log.Write("Time nodes total: " + usedTimeNodes.count(), StudentScheduler.Log.Severity.Info);

                //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
                var edges = usedTimeNodes.where(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null, "GetResult") === 1;
                        }).count() === 1;
                }).select(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null, "GetREsult2") === 1;
                        }).single();
                });

                StudentScheduler.Log.Write("Time nodes with selected edge: " + edges.count(), StudentScheduler.Log.Severity.Info);

                return edges.select(Bridge.fn.bind(this, function (edge) {
                    var $t;
                    return ($t = new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview(), $t.assignedStudent = System.Linq.Enumerable.from(this.students).where(function (student) {
                            var $t1;
                            return Bridge.referenceEquals(student.name, ($t1 = System.String.split(edge.From.Identifier, [58].map(function(i) {{ return String.fromCharCode(i); }})))[System.Array.index(1, $t1)]);
                        }).single(), $t.day = day, $t.timeStart = edge.To.Value, $t);
                })).orderBy(function (result) {
                    return result.timeStart;
                }).toList(StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview);
            },
            ApplyStudent: function (result) {
                result.assignedStudent.assigned = true;
                result.assignedStudent.assignedDay = result.day;
                result.assignedStudent.assignedMinutes = result.timeStart;
            },
            ApplyFlow: function (rootNode, endNode, flowPath) {
                var nextNode = endNode;
                while (!Bridge.referenceEquals(nextNode, rootNode)) {
                    var edge = this.GetEdgeInfo(nextNode, flowPath.get(nextNode));

                    if (edge.IsFromNode1ToNode2) {
                        edge.ResultEdge.SetCurrentFlow(0);
                        StudentScheduler.Log.Write(System.String.format("Setting edge flow from {0} to {1} to 0", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier), StudentScheduler.Log.Severity.Warning);
                    } else {
                        edge.ResultEdge.SetCurrentFlow(1);
                        StudentScheduler.Log.Write(System.String.format("Setting edge flow from {0} to {1} to 1", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier), StudentScheduler.Log.Severity.Info);
                    }

                    nextNode = flowPath.get(nextNode);
                }
            },
            GetEdgeInfo: function (node1, node2) {
                var result = new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo();
                var edg = System.Linq.Enumerable.from(node1.OutputEdges).where(function (edge) {
                        return Bridge.referenceEquals(edge.To, node2);
                    }).firstOrDefault(null, null);

                result.IsFromNode1ToNode2 = edg != null;

                if (edg == null) {
                    edg = System.Linq.Enumerable.from(node1.InputEdges).where(function (edge) {
                            return Bridge.referenceEquals(edge.From, node2);
                        }).firstOrDefault(null, null);
                }

                result.ResultEdge = edg;

                return result.$clone();
            },
            toString: function () {
                var $t, $t1;
                var command = "graph LR\r\n";

                $t = Bridge.getEnumerator(this.Nodes);
                try {
                    while ($t.moveNext()) {
                        var n = $t.Current;
                        $t1 = Bridge.getEnumerator(n.OutputEdges);
                        try {
                            while ($t1.moveNext()) {
                                var outputEdge = $t1.Current;
                                command = (command || "") + ((System.String.format("{0} -->|{1}| {2}\r\n", outputEdge.From.Identifier, Bridge.box(outputEdge.GetCurrentFlow(System.Array.init(0, null, StudentScheduler.AppLogic.NetworkFlow.Node), this, "ThisToString"), System.Int32), outputEdge.To.Identifier)) || "");
                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }

                return command;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview(); }
            }
        },
        fields: {
            timeStart: 0,
            day: 0,
            assignedStudent: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([7090130162, this.timeStart, this.day, this.assignedStudent]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview)) {
                    return false;
                }
                return Bridge.equals(this.timeStart, o.timeStart) && Bridge.equals(this.day, o.day) && Bridge.equals(this.assignedStudent, o.assignedStudent);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview();
                s.timeStart = this.timeStart;
                s.day = this.day;
                s.assignedStudent = this.assignedStudent;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo(); }
            }
        },
        fields: {
            ResultEdge: null,
            IsFromNode1ToNode2: false
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([3570258574, this.ResultEdge, this.IsFromNode1ToNode2]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo)) {
                    return false;
                }
                return Bridge.equals(this.ResultEdge, o.ResultEdge) && Bridge.equals(this.IsFromNode1ToNode2, o.IsFromNode1ToNode2);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo();
                s.ResultEdge = this.ResultEdge;
                s.IsFromNode1ToNode2 = this.IsFromNode1ToNode2;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Node", {
        fields: {
            Identifier: null,
            Value: 0,
            InputEdges: null,
            OutputEdges: null,
            Type: 0
        },
        ctors: {
            ctor: function (identifier, value, type) {
                this.$initialize();
                this.Identifier = identifier;
                this.Value = value;
                this.Type = type;
                this.InputEdges = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Edge)).ctor();
                this.OutputEdges = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Edge)).ctor();
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Node.NodeType", {
        $kind: "enum",
        statics: {
            fields: {
                Default: 0,
                Input: 1,
                Output: 2
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
                        if (possedStudentsToday === StudentScheduler.AppLogic.Plan.breakAfterLessons && this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] !== 2147483647) {
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
                var $t, $t1;
                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    $t = Bridge.getEnumerator(this.teachers);
                    try {
                        while ($t.moveNext()) {
                            var teacher = $t.Current;
                            if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength) {
                                teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)] = true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    $t1 = Bridge.getEnumerator(this.students);
                    try {
                        while ($t1.moveNext()) {
                            var student = $t1.Current;
                            if (((student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] - student.minutesFromAvailable[System.Array.index(day, student.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength) {
                                student.daysAvailable[System.Array.index(day, student.daysAvailable)] = true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }}



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
                //TryToPosAllStudentsVer2();
                // Second stage
                //PosNotPossedStudents();



                // OR I could do it this way:

                // 1            For all days where at least 1 teacher + 1 student has time and someone is not assigned yet
                // 1.1          Pos 3 students this way: Pos student that can be there the earliest time. If there is someone, that can be there
                //              <50 minutes after the student and has less time, place him instead
                // 1.2          Place a break
                // 1.3          Place as many students as you can

                // 2            For all unassigned students:
                // 2.1          Get all students that are blocking him. Do this for all (ordered by number of time) of them unless the student is possed:
                // 2.1.1        Swap these students. Remember to move other students behind him if neccessary. Be careful if someone loses position because of this
                // 2.1.2        If these swapped students (that don't have time now) don't have [direct] place to stay, revert changes
                // 2.1.3        Else, place students there and go back to [2]


                //PosStudents();
                //IDontCareJustPossStudents(); // THIS WASNT COMMENTED






                // USING FLOWS:

                try {
                    this.DoItUsingFlows();
                }
                catch (ex) {
                    ex = System.Exception.create(ex);
                    StudentScheduler.Log.Write(ex, StudentScheduler.Log.Severity.Critical);
                }
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
                                StudentScheduler.Log.Write(System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).select(function (x) {
                                    return x.name;
                                }).toArray(System.String).join(", "), StudentScheduler.Log.Severity.Info);
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
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength && !x.assigned;
                        }).toArray(StudentScheduler.AppLogic.User);

                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength || studentsForThisDay.length === 0) {
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
            },
            PosStudents: function () {
                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    // Assuming I have just one teacher
                    var teacher = this.teachers.getItem(0);

                    // Get all students that have at least 50mins time today and still don't have anything assigned
                    var studentsForThisDay = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength && !x.assigned;
                        }).orderBy(function (x) {
                        return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                    }).toArray(StudentScheduler.AppLogic.User);

                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength || !teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)] || studentsForThisDay.length === 0) {
                        return;
                    }

                    var possed = 0;
                    // Go thru all teacher hours
                    for (var time = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] }; time.v <= ((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0); time.v = (time.v + 5) | 0) {
                        // Lets take a break
                        if (possed === 3) {
                            this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = time.v;
                            time.v = (time.v + (10)) | 0;
                            possed = (possed + 1) | 0;
                        }

                        // If there is student available
                        var studentsAvailable = System.Linq.Enumerable.from(studentsForThisDay).where((function ($me, time) {
                                return function (x) {
                                    return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] <= time.v && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] >= ((time.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                };
                            })(this, time)).orderBy(function (x) {
                            return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                        }); // TODO: Kdyz jsou dva se stejnyma hodinama, uprednostnit toho, kdo ma min casu
                        StudentScheduler.Log.Write(Bridge.toArray(studentsAvailable.select(function (x) {
                                return (x.name || "") + ": " + x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                            })).join(", "), StudentScheduler.Log.Severity.Info);

                        var chosenStudent = studentsAvailable.firstOrDefault(null, null);

                        if (chosenStudent == null) {
                            continue;
                        }

                        chosenStudent.assignedMinutes = time.v;
                        chosenStudent.assignedDay = day;
                        chosenStudent.assigned = true;

                        time.v = (time.v + (45)) | 0;

                        possed = (possed + 1) | 0;
                    }
                }
            },
            BruteForceStudents$1: function () {
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)]) {
                        var result = this.BruteForceStudents(day, teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)], teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)], 0);
                        for (var i = 0; i < result.Count; i = (i + 1) | 0) {
                            result.getItem(i).$clone().student.assigned = true;
                            result.getItem(i).$clone().student.assignedDay = day;
                            result.getItem(i).$clone().student.assignedMinutes = result.getItem(i).$clone().minutesFrom;
                        }
                    }
                }
            },
            BruteForceStudents: function (day, startTime, endTime, studentsPossed) {
                var $t;
                if (startTime >= ((endTime - StudentScheduler.AppLogic.Plan.lessonLength) | 0)) {
                    return new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                }

                var startStudent = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] >= startTime && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] <= endTime;
                    }).orderBy(function (x) {
                    return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                }).firstOrDefault(null, null);
                if (startStudent == null) {
                    startTime = (startTime + 5) | 0;
                    return this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                }

                var startStudentStartTime = startStudent.minutesFromAvailable[System.Array.index(day, startStudent.minutesFromAvailable)];


                studentsPossed = (studentsPossed + 1) | 0;
                startTime = (startTime + StudentScheduler.AppLogic.Plan.lessonLength) | 0;
                if (studentsPossed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                    startTime = (startTime + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                }
                var anotherStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] > ((startStudentStartTime - StudentScheduler.AppLogic.Plan.lessonLength) | 0) && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] <= endTime && !Bridge.referenceEquals(x, startStudent);
                    });

                StudentScheduler.Log.Write("----------------------", StudentScheduler.Log.Severity.Info);
                StudentScheduler.Log.Write((startStudent.name || "") + ",", StudentScheduler.Log.Severity.Info);
                StudentScheduler.Log.Write(Bridge.toArray(anotherStudents.select(function (x) {
                        return x.name;
                    })).join(","), StudentScheduler.Log.Severity.Info);

                var preResult = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent))).ctor();

                {
                    var possResult = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                    possResult.add(new StudentScheduler.AppLogic.BruteForcedStudent.$ctor1(startStudentStartTime, startStudent));
                    var newStudents = this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                    if (newStudents != null) {
                        possResult.addRange(newStudents);
                    }
                    preResult.add(possResult);
                }
                $t = Bridge.getEnumerator(anotherStudents);
                try {
                    while ($t.moveNext()) {
                        var anotherStudent = $t.Current;
                        var possibleResult = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                        possibleResult.add(new StudentScheduler.AppLogic.BruteForcedStudent.$ctor1(Math.max(startTime, anotherStudent.minutesFromAvailable[System.Array.index(day, anotherStudent.minutesFromAvailable)]), anotherStudent));
                        var newStudents1 = this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                        if (newStudents1 != null) {
                            possibleResult.addRange(newStudents1);
                        }
                        preResult.add(possibleResult);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }System.Linq.Enumerable.from(preResult).orderByDescending(function (x) {
                        return x.Count;
                    });

                return System.Linq.Enumerable.from(preResult).first();
            },
            IDontCareJustPossStudents: function () {
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)]) {
                        var startTime = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] };
                        var endTime = teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)];
                        var studentsPossed = 0;

                        for (var minute = { v : 0 }; minute.v < ((endTime - startTime.v) | 0); ) {
                            var studentsRightNow = System.Linq.Enumerable.from(this.students).where((function ($me, startTime, minute) {
                                    return function (x) {
                                        return !x.assigned && x.daysAvailable[System.Array.index(day, x.daysAvailable)] && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] <= ((startTime.v + minute.v) | 0) && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] >= ((((startTime.v + minute.v) | 0) + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                    };
                                })(this, startTime, minute));

                            if (studentsRightNow.count() === 0) {
                                minute.v = (minute.v + 1) | 0;
                                continue;
                            }

                            var studentToPos = studentsRightNow.first(); // TODO: Choose someone better way
                            studentToPos.assigned = true;
                            studentToPos.assignedDay = day;
                            studentToPos.assignedMinutes = (startTime.v + minute.v) | 0;

                            studentsPossed = (studentsPossed + 1) | 0;

                            minute.v = (minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0;

                            if (studentsPossed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                                this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = (startTime.v + minute.v) | 0;
                                minute.v = (minute.v + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                                studentsPossed = (studentsPossed + 1) | 0;
                            }
                        }
                    }
                }
            },
            DoItUsingFlows: function () {
                var flow = new StudentScheduler.AppLogic.NetworkFlow.Flow(this.teachers.getItem(0), this.students);
                var breaks = flow.GetResult();
                this.breakAfterLessonsStart = breaks;
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

    Bridge.define("StudentScheduler.Log", {
        statics: {
            fields: {
                lengthCollapseStart: 0,
                previewLength: 0,
                target: null,
                counter: 0
            },
            ctors: {
                init: function () {
                    this.lengthCollapseStart = 2147483647;
                    this.previewLength = 30;
                    this.counter = 0;
                }
            },
            methods: {
                InitializeWithDiv: function (targetDiv) {
                    StudentScheduler.Log.target = targetDiv;
                },
                Write: function (o, severity) {
                    // Log object to javascript console
                    console.log(Bridge.unbox(o));
                    // Log object with severity to the div
                    var text = o.toString();

                    var html = "";
                    // If the text is very long, collapse it
                    if (text.length > StudentScheduler.Log.lengthCollapseStart) {

                        var preview = (text.substr(0, StudentScheduler.Log.previewLength) || "") + "...";
                        html = "<button type='button' class='logExpandable' data-toggle='collapse' data-target='#collapse-log-" + StudentScheduler.Log.counter + "'>" + "<p style='color: " + (StudentScheduler.Log.GetColorBasedOnSeverity(severity) || "") + ";'>" + (preview || "") + "</p></div>";
                        html = (html || "") + (("<div class='collapse row' id='collapse-log-" + StudentScheduler.Log.counter + "'><div class='card card-body'>" + (text || "") + "</div></div>") || "");
                        StudentScheduler.Log.counter = (StudentScheduler.Log.counter + 1) | 0;
                    } else {
                        html = "<p style='color: " + (StudentScheduler.Log.GetColorBasedOnSeverity(severity) || "") + ";'>" + (text || "") + "<p>";
                    }

                    StudentScheduler.Log.WriteToDebug(html);
                },
                WriteToDebug: function (html) {
                    StudentScheduler.Log.target.innerHTML = (StudentScheduler.Log.target.innerHTML || "") + (((html || "") + "<hr />") || "");
                },
                GetColorBasedOnSeverity: function (severity) {
                    switch (severity) {
                        case StudentScheduler.Log.Severity.Info: 
                            return "Black";
                        case StudentScheduler.Log.Severity.Warning: 
                            return "Green";
                        case StudentScheduler.Log.Severity.Critical: 
                            return "Red";
                    }

                    return "Black";
                }
            }
        }
    });

    Bridge.define("StudentScheduler.Log.Severity", {
        $kind: "enum",
        statics: {
            fields: {
                Info: 0,
                Warning: 1,
                Critical: 2
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.TimeChunk", {
        inherits: [StudentScheduler.AppLogic.NetworkFlow.Edge],
        ctors: {
            ctor: function (from, to) {
                this.$initialize();
                StudentScheduler.AppLogic.NetworkFlow.Edge.ctor.call(this, 0, 0, from, to);
            }
        },
        methods: {
            GetBlockingNodes: function (timeNodes, baseNode) {
                var blockingNodes = System.Linq.Enumerable.from(timeNodes).where(function (tNode) {
                        return Math.abs(((tNode.Value - baseNode.Value) | 0)) < 50;
                    }).count();

                if (blockingNodes === 0) {
                    StudentScheduler.Log.Write("I just passed with this settings: " + (Bridge.toArray(System.Linq.Enumerable.from(timeNodes).select(function (node) {
                                return (node.Identifier || "") + " with value " + node.Value;
                            })).join(" , ") || "") + ". Base was " + (baseNode.Identifier || "") + " with value " + baseNode.Value, StudentScheduler.Log.Severity.Critical);
                } else {
                    StudentScheduler.Log.Write("I didn't pass with this settings:" + (Bridge.toArray(System.Linq.Enumerable.from(timeNodes).select(function (node) {
                                return (node.Identifier || "") + " with value " + node.Value;
                            })).join(" , ") || "") + ". Base was " + (baseNode.Identifier || "") + " with value " + baseNode.Value, StudentScheduler.Log.Severity.Critical);
                }

                return blockingNodes;
            },
            /**
             * @instance
             * @public
             * @override
             * @this StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @memberof StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @param   {System.Collections.Generic.IEnumerable$1}      currentPath    
             * @param   {StudentScheduler.AppLogic.NetworkFlow.Flow}    flow           
             * @param   {string}                                        info
             * @return  {number}                                                       Number of nodes that block current path
             */
            GetCurrentFlow: function (currentPath, flow, info) {
                if (Bridge.referenceEquals(info, "ThisToString")) {
                    return -2147483648;
                }

                var blockingNodes = -1;
                try {
                    var baseNode = System.Linq.Enumerable.from(currentPath).toList(Bridge.global.StudentScheduler.AppLogic.NetworkFlow.Node).getItem(((System.Linq.Enumerable.from(currentPath).count() - 2) | 0));
                    StudentScheduler.Log.Write("GetCurrentFlow Path: " + (Bridge.toArray(System.Linq.Enumerable.from(currentPath).select(function (node) {
                                return node.Value;
                            })).join(",") || ""), StudentScheduler.Log.Severity.Info);
                    var allTimeNodes = System.Linq.Enumerable.from(flow.Nodes).where(function (node) {
                            return node.Value !== -1 && !Bridge.referenceEquals(node, baseNode) && System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                                    return edge.GetCurrentFlow(null, null, "GetCurrentFlow") === 1;
                                }).count() === 1;
                        }).toList(StudentScheduler.AppLogic.NetworkFlow.Node);
                    allTimeNodes.addRange(System.Linq.Enumerable.from(currentPath).where(function (node) {
                            return node.Value !== -1 && !Bridge.referenceEquals(node, baseNode);
                        }));
                    StudentScheduler.Log.Write("Starting BlockingNodes...", StudentScheduler.Log.Severity.Info);
                    blockingNodes = this.GetBlockingNodes(allTimeNodes, baseNode);
                    StudentScheduler.Log.Write("Ending BlockingNodes...", StudentScheduler.Log.Severity.Info);
                }
                catch (ex) {
                    ex = System.Exception.create(ex);
                    StudentScheduler.Log.Write("BlockingNodes Failed! Info: " + (info || ""), StudentScheduler.Log.Severity.Critical);
                    StudentScheduler.Log.Write(ex, StudentScheduler.Log.Severity.Critical);
                    throw ex;
                }
                return blockingNodes;
            },
            SetCurrentFlow: function (newValue) {
                // Do nothing
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvTmV0d29ya0Zsb3cvRWRnZS5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L0Zsb3cuY3MiLCJBcHBMb2dpYy9OZXR3b3JrRmxvdy9Ob2RlLmNzIiwiQXBwTG9naWMvVXNlci5jcyIsIkxvZy5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L1RpbWVDaHVuay5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLCtCQUFMQSxLQUFLQSxZQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLGdDQUFMQSxLQUFLQSxhQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSxLQUFLQSxnQ0FBTEEsS0FBS0EsYUFBY0E7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLEtBQUtBOzs7O1lBRTNEQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7WUFHckVBLDJDQUFzQkEsVUFBQ0E7Ozs7Ozs7OztnQkFVbkJBLHVDQUFrQkEsSUFBSUEsK0NBQXFCQSx1RUFBaURBLG1CQUFZQSxpQ0FBdUJBLG1CQUFZQTs7Z0JBRTNJQSx1Q0FBa0JBLElBQUlBLDRDQUFrQkEsdUVBQWlEQSxtQkFBWUEsaUNBQXVCQSxtQkFBWUE7Z0JBQ3hJQSx1Q0FBa0JBLElBQUlBLDRDQUFrQkEsdUVBQWlEQSxtQkFBWUEsaUNBQTRCQSxtQkFBWUE7O2dCQUU3SUE7Z0JBQ0FBLCtDQUEwQkE7OztZQUc5QkEsdUNBQXNCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBR1FBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JBLDZDQUFhQSx1Q0FBWUE7b0JBQ3BFQSxVQUFrQkE7O29CQUVsQkEsV0FBc0JBO29CQUN0QkE7b0JBQ0FBLDJDQUFrQkEsa0JBQWdCQTtvQkFDbENBLGVBQTZCQTtvQkFDN0JBLGdCQUFnQkEsQ0FBQ0E7b0JBQ2pCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsdURBQW9CQSxVQUFDQTt3QkFBUUEsb0NBQWVBOztvQkFDNUNBLGlCQUFpQkE7b0JBQ2pCQSxnQkFBZ0JBOztvQkFFaEJBOzs7b0JBR0FBOzt5Q0FHOEJBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JBLDZDQUFhQSx1Q0FBWUE7b0JBQ3BFQSxVQUFrQkE7O29CQUVsQkEsV0FBc0JBO29CQUN0QkE7b0JBQ0FBLDJDQUFrQkEsa0JBQWdCQTtvQkFDbENBLGVBQTZCQTtvQkFDN0JBLGdCQUFnQkEsQ0FBQ0E7b0JBQ2pCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsdURBQW9CQSxVQUFDQTt3QkFBUUEsb0NBQWVBOztvQkFDNUNBLGlCQUFpQkE7b0JBQ2pCQSxnQkFBZ0JBOztvQkFFaEJBOzswQ0FHK0JBLFFBQWVBO29CQUU5Q0EseUNBQW9CQTtvQkFDcEJBLGlDQUFZQSxtQkFBVUEsQ0FBQ0E7b0JBQ3ZCQSx5QkFBZ0NBLENBQUNBLGFBQWFBLHFDQUFnQkE7O29CQUU5REEsd0RBQW1DQSwyQkFBbUJBO29CQUN0REEseURBQW9DQSwyQkFBbUJBO29CQUN2REEsMkRBQXNDQSwyQkFBbUJBO29CQUN6REEsMERBQXFDQSwyQkFBbUJBO29CQUN4REEsd0RBQW1DQSwyQkFBbUJBOztvQkFFdERBLDZEQUF3Q0EscUJBQW9CQSwyQkFBbUJBOztvQkFFL0VBOztpREFHc0NBO29CQUV0Q0EsNkJBQVFBLG1CQUFVQSxDQUFDQTs7b0JBRW5CQSxvQkFBb0JBO29CQUNwQkEsb0JBQW9CQTtvQkFDcEJBLGtCQUFrQkE7b0JBQ2xCQSxrQkFBa0JBOztvQkFFbEJBLGlCQUFpQkEseUNBQW9CQSxxQ0FBZ0JBOztvQkFFckRBLFVBQVVBLG1CQUFXQTs7O29CQUdyQkEsSUFBSUEsNENBQXlCQSw0QkFBekJBO3dCQUVBQSxnQkFBZ0JBLGtCQUFLQSxXQUFXQSw0Q0FBeUJBLDRCQUF6QkE7d0JBQ2hDQSxzQkFBc0JBO3dCQUN0QkEsc0JBQXNCQSxDQUFDQSw4Q0FBeUJBLDRCQUF6QkEsNkJBQWtDQTs7d0JBSXpEQTt3QkFDQUE7Ozs7b0JBSUpBLElBQUlBLDBDQUF1QkEsNEJBQXZCQTt3QkFFQUEsY0FBY0Esa0JBQUtBLFdBQVdBLDBDQUF1QkEsNEJBQXZCQTt3QkFDOUJBLG9CQUFvQkE7d0JBQ3BCQSxvQkFBb0JBLHNCQUFDQSwwQ0FBdUJBLDRCQUF2QkEsMkJBQWdDQTs7d0JBSXJEQTt3QkFDQUE7Ozs7O29CQU1KQTt3QkFFSUEsaUJBQWlCQSx5Q0FBb0JBLHFDQUFnQkE7O3dCQUVyREEsV0FBV0EsQUFBS0EsQUFBQ0Esb0NBQVVBLENBQUNBLHlGQUEyREEsbUJBQVVBLENBQUNBO3dCQUNsR0EsU0FBU0EsQUFBS0EsQUFBQ0Esb0NBQVVBLENBQUNBLHVGQUF5REEsbUJBQVVBLENBQUNBOzt3QkFFOUZBLElBQUlBLFNBQU9BLG9EQUFvQkE7NEJBRTNCQTs0QkFDQUE7Ozt3QkFHSkEseUJBQVdBLHlFQUFnQ0EsbUNBQVNBO3dCQUNwREEsMEJBQVdBLHVFQUE4QkEsb0NBQVNBOzs7Ozs7OztvQkFPdERBLGlCQUFpQkEseUNBQW9CQSxxQ0FBZ0JBOztvQkFFckRBLHlCQUFXQSx5RUFBZ0NBO29CQUMzQ0EsMEJBQVdBLHVFQUE4QkE7Ozs7b0JBS3pDQSxpQkFBaUJBLHlDQUFvQkEscUNBQWdCQTs7O29CQUdyREEsS0FBS0EsV0FBV0EsT0FBT0E7d0JBRW5CQSx5QkFBSUEsZUFBY0EsNkNBQUtBLEdBQUxBLGdEQUFxQkEsMkJBQVdBLHVFQUE4QkEsVUFBS0EsMEJBQVdBLHlFQUFnQ0EsaUJBQUtBLGlFQUN0R0EsK0NBQXlCQSwwQkFBV0EseUVBQWdDQSw0QkFBY0EsOENBQXlCQSwwQkFBV0EsdUVBQThCQTs7O29EQU01SUE7b0JBRTNDQSxZQUFZQSxrQkFBS0EsV0FBV0E7b0JBQzVCQSxPQUFPQSxrREFBNkJBLHFCQUFDQSxZQUFVQTs7c0VBR2NBO29CQUU3REEsVUFBYUE7b0JBQ2JBLElBQUlBO3dCQUNBQSxNQUFNQSxPQUFNQTs7b0JBQ2hCQSxPQUFPQTs7K0JBR29CQTtvQkFBWUEsT0FBT0Esd0JBQXdCQTs7K0JBQ3hDQTtvQkFBYUEsT0FBT0EscUNBQXFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhCQzhRakVBLGFBQWlCQTs7Z0JBRXZDQSxtQkFBbUJBO2dCQUNuQkEsZUFBZUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJDeGZQQSxVQUFjQSxhQUFpQkEsTUFBV0E7O2dCQUVsREEsZ0JBQVdBO2dCQUNYQSxtQkFBbUJBO2dCQUNuQkEsWUFBT0E7Z0JBQ1BBLFVBQUtBOzs7O3NDQUd5QkEsYUFBK0JBLE1BQVdBO2dCQUV4RUEsT0FBT0E7O3NDQUd3QkE7Z0JBRS9CQSxtQkFBY0E7Ozs7Ozs7Ozs7Ozs0QkNkTkEsU0FBY0E7O2dCQUV0QkEsZUFBZUE7Z0JBQ2ZBLGdCQUFnQkE7Z0JBQ2hCQSxhQUFhQSxLQUFJQTs7Ozs7Ozs7Ozs7Ozs7O2dCQVNqQkEsYUFBZUE7O2dCQUVmQSxLQUFLQSxhQUFhQSxTQUFTQTtvQkFFdkJBLDJCQUFVQSxtRUFBMERBLGlDQUFNQTtvQkFDMUVBLGdCQUFXQTtvQkFDWEE7b0JBQ0FBLHNDQUFxQkE7b0JBQ3JCQSxvQkFBb0JBLHdCQUFtQkE7O29CQUV2Q0EsSUFBSUE7O3dCQUdBQSxLQUFLQSxXQUFXQSxPQUFPQTs0QkFBS0Esa0JBQWFBLHNCQUFjQTs7O3dCQUV2REEsMEJBQU9BLEtBQVBBLFdBQWNBOzt3QkFFZEEsZ0JBQVdBLEtBQUtBLDBCQUFPQSxLQUFQQSxVQUFhQSw0QkFBT0EsS0FBUEEsV0FBY0E7d0JBQzNDQTt3QkFDQUEsZ0JBQWdCQSx3QkFBbUJBOzt3QkFJbkNBLDBCQUFPQSxLQUFQQSxXQUFjQTs7OztvQkFJbEJBLDBCQUFxQ0E7Ozs7NEJBQWVBLGtCQUFhQTs7Ozs7Ozs7Z0JBR3JFQSwyQkFBVUEsYUFBWUEsZUFBdUJBLDJCQUFTQTs7Z0JBRXREQSxPQUFPQTs7a0NBR2FBLEtBQVNBLG9CQUE2QkE7Ozs7Z0JBRTFEQTs7Z0JBRUFBLFdBQVlBLElBQUlBLG9EQUFjQSxJQUFJQTtnQkFDbENBLGVBQVVBOzs7Z0JBR1ZBLDBCQUF5QkE7Ozs7d0JBRXJCQSxJQUFJQSxvQkFBb0JBLENBQUNBLHlDQUFzQkEsS0FBdEJBOzRCQUNyQkE7Ozs7d0JBR0pBLGtCQUFtQkEsSUFBSUEsMkNBQUtBLGNBQWFBLHFCQUFjQSxJQUFJQTt3QkFDM0RBLDJCQUFzQkE7Ozs7Ozs7O2dCQUkxQkEsZ0JBQWlCQSxJQUFJQSx3REFBa0JBLElBQUlBOztnQkFFM0NBLHlCQUF5QkEsNEJBQXFFQSxxQkFBU0EsQUFBb0VBOytCQUFXQSx5QkFBdUJBOzhCQUFrQkEsQUFBbUVBOzJCQUFXQTs7OztnQkFHN1NBLEtBQUtBLGNBQWNBLE9BQU9BLE1BQVNBOztvQkFHL0JBLElBQUlBLENBQUNBLFFBQVFBLHNCQUFzQkEsUUFBUUEscUJBQ3ZDQSx5QkFBeUJBLEFBQWlDQTsrQkFBV0EsU0FBU0EsWUFBVUE7O3dCQUN4RkE7OztvQkFFSkEsSUFBSUEsNkRBQTZCQSxjQUFRQSxRQUFRQSw2REFBMkJBLGFBQU9BLHFEQUFxQkE7O3dCQUdwR0EseUJBQWlFQSw0QkFBcUVBLHFCQUFTQSxBQUFvRUE7dUNBQVdBLENBQUNBLHFCQUNuSUEsMENBQXNCQSxLQUF0QkEsNEJBQ0FBLGlEQUE2QkEsS0FBN0JBLG1DQUFxQ0EsUUFDckNBLGlEQUEyQkEsS0FBM0JBLGdDQUFrQ0EscURBQXFCQTs7O3dCQUVuSkEsZUFBZ0JBLElBQUlBLDJDQUFLQSxVQUFVQSxNQUFNQSxNQUFNQTt3QkFDL0NBLDJCQUF5QkE7Ozs7Z0NBRXJCQSxrQkFBYUEsY0FBYUEsc0JBQWNBOzs7Ozs7eUJBRTVDQSxrQkFBYUEsVUFBVUEsTUFBTUE7Ozs7O2dCQUtyQ0EsYUFBY0EsSUFBSUEscURBQWVBLElBQUlBO2dCQUNyQ0EsK0JBQTBCQTs7O2dCQUcxQkEsb0JBQTBCQSxJQUFJQSxnREFBVUEsV0FBV0E7Z0JBQ25EQTtnQkFDQUEsMEJBQTBCQTtnQkFDMUJBO2dCQUNBQSxzQkFBc0JBOztvQ0FHQUEsWUFBbUJBOztnQkFFekNBLDBCQUFzQkE7Ozs7d0JBRWxCQSxJQUFJQSx3Q0FBbUJBOzRCQUVuQkEsY0FBZUEsSUFBSUEsaURBQVdBLE1BQU1BOzRCQUNwQ0EscUJBQXFCQTs0QkFDckJBLHVCQUF1QkE7NEJBQ3ZCQTs7Ozs7OztpQkFHUkEsSUFBSUEsQ0FBQ0Esb0JBQWVBO29CQUNoQkEsZUFBVUE7Ozs7O2dCQU1kQSxPQUFPQTtvQkFBaUJBOzs7Ozs7Ozs7Ozs7Z0JBYXhCQSxlQUFrQ0EsNkNBQWVBLDRDQUFNQTtnQkFDdkRBLEtBQUtBLFdBQVdBLElBQUlBLGtCQUFhQTtvQkFBS0EsYUFBYUEsbUJBQU1BLElBQUlBOzs7Z0JBRTdEQSxxQkFBNkJBLEtBQUlBO2dCQUNqQ0EsdUJBQXVCQTs7Z0JBRXZCQSx3QkFBa0NBLEtBQUlBO2dCQUN0Q0Esc0JBQXNCQTtnQkFDdEJBLE9BQU9BOztvQkFHSEEsV0FBWUE7OztvQkFHWkEsb0JBQTJCQSxLQUFJQSxzRkFBV0EsMkJBQXlCQTs7b0JBRW5FQTtvQkFDQUE7b0JBQ0FBLG1CQUEwQkEsZ0JBQVdBLDRCQUFpRkEscUJBQVFBLE1BQU1BO29CQUNwSUEsMEJBQTRCQTs7Ozs0QkFFeEJBLFdBQVdBLDBCQUEwQkEsY0FBY0E7NEJBQ25EQSxJQUFJQTtnQ0FDQUE7OzRCQUNKQSxJQUFJQTtnQ0FFQUEsa0JBQWtCQTtnQ0FDbEJBOzs7Ozs7O3FCQUdSQSxJQUFJQSxnQkFBZ0JBLENBQUNBO3dCQUVqQkEsMkJBQTJCQTs7Ozs7Ozs7O2dDQU92QkEsMkJBQVVBLGlDQUF5QkEsa0JBQWtCQTs7OztnQ0FJckRBLElBQUlBO29DQUVBQSwyQkFBVUEscURBQW9EQSxnQ0FBeUJBOzs7O2dDQUkzRkEsSUFBSUEsMkJBQTJCQSx1Q0FBa0JBLHFCQUFhQTtvQ0FDMURBOzs7Z0NBRUpBLFlBQVdBLHlCQUF5QkEsY0FBY0E7Z0NBQ2xEQSxJQUFJQTtvQ0FFQUEsa0JBQWtCQTtvQ0FDbEJBLDJCQUFVQSw4Q0FBNkNBLGVBQW1CQSw0QkFBeUZBLHFCQUFhQSxBQUFrRkE7dURBQUtBLHFDQUE2QkEsY0FBYUE7K0ZBQXVDQSwyQ0FBb0NBLDRCQUE0QkE7Ozs7Ozs7Ozs7OztvQkFRcGFBLDJCQUFpQ0E7Ozs7NEJBRTdCQSxJQUFJQSwyQkFBMkJBO2dDQUMzQkE7Ozs0QkFFSkEsc0JBQXNCQTs0QkFDdEJBLGFBQVNBLGlCQUFtQkE7NEJBQzVCQSx1QkFBdUJBOzs7Ozs7Ozs7Z0JBSy9CQSwyQkFBVUEsaUJBQWlCQTtnQkFDM0JBLHlCQUFvQkE7Z0JBQ3BCQSxnQkFBZ0JBLDRCQUFpRkEsMEJBQWNBLEFBQWdGQTsrQkFBS0E7O2dCQUNwTUEsSUFBSUEsYUFBYUEsUUFBUUEsYUFBU0EsY0FBY0E7b0JBRTVDQSxzQ0FBcUJBOztvQkFFckJBOztvQkFJQUEsNENBQTJCQTtvQkFDM0JBLGVBQVVBLDRCQUFpRkEscUJBQVFBLFdBQVdBO29CQUM5R0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJDQXFCeUJBO2dCQUU3QkEsYUFBZ0JBLFlBQVdBLGVBQW1CQSw0QkFBeUZBLDJCQUFjQSxBQUFrRkE7bUNBQUtBOztnQkFDNU9BO2dCQUNBQSwyQkFBVUEsZUFBYUEsZUFBbUJBLDRCQUF5RkEsNkJBQWdCQSxBQUFrRkE7bUNBQUtBLEtBQUtBLGVBQWVBOztnQkFDOVBBLDJCQUFVQSxRQUFRQTs7a0NBR1FBLFVBQWVBLFNBQWNBO2dCQUV2REEsV0FBa0JBLEtBQUlBO2dCQUN0QkEsU0FBU0E7O2dCQUVUQSxlQUFnQkE7Z0JBQ2hCQSxPQUFPQSxrQ0FBWUE7b0JBRWZBLFdBQVdBLGFBQVNBO29CQUNwQkEsU0FBU0E7OztnQkFHYkE7Z0JBQ0FBLE9BQU9BOzswQ0FHd0NBO2dCQUUvQ0EsMERBQXlDQTs7Z0JBRXpDQSxnQkFBZ0JBLDRCQUFpRkEsa0JBQU1BLEFBQWdGQTsrQkFBUUEsZUFBY0E7OztnQkFFN01BLG9CQUFvQkEsZ0JBQWdCQSxBQUFnRkE7MkJBQVFBOzs7Z0JBRTVIQSwyQkFBVUEsdUJBQXVCQSx1QkFBdUJBOzs7Z0JBR3hEQSxZQUFZQSxvQkFBb0JBLEFBQWdGQTsyQkFBUUEsNEJBQWlGQSx1QkFBZ0JBLEFBQWdGQTttQ0FBUUEsb0JBQW9CQSxNQUFNQTs7MEJBQ3RQQSxBQUE4SEE7MkJBQVFBLDRCQUFpRkEsdUJBQWdCQSxBQUFnRkE7bUNBQVFBLG9CQUFvQkEsTUFBTUE7Ozs7Z0JBRTlhQSwyQkFBVUEsb0NBQW9DQSxlQUFlQTs7Z0JBRTdEQSxPQUFPQSxhQUFtRkEsQUFBZ0pBOzsyQkFBUUEsVUFBSUEscUZBRWhPQSw0QkFBcUVBLHFCQUFTQSxBQUFvRUE7O21DQUFXQSxxQ0FBZ0JBOzhDQUN6TEEsb0JBQ01BOzRCQUNDQSxBQUFpR0E7MkJBQVVBOzs7b0NBR3RHQTtnQkFFdEJBO2dCQUNBQSxxQ0FBcUNBO2dCQUNyQ0EseUNBQXlDQTs7aUNBR3RCQSxVQUFlQSxTQUFjQTtnQkFFaERBLGVBQWdCQTtnQkFDaEJBLE9BQU9BLGtDQUFZQTtvQkFFZkEsV0FBZ0JBLGlCQUFZQSxVQUFVQSxhQUFTQTs7b0JBRS9DQSxJQUFJQTt3QkFFQUE7d0JBQ0FBLDJCQUFVQSwrREFBdURBLGlDQUFnQ0EsZ0NBQWdDQTs7d0JBSWpJQTt3QkFDQUEsMkJBQVVBLCtEQUF1REEsaUNBQWdDQSxnQ0FBZ0NBOzs7b0JBR3JJQSxXQUFXQSxhQUFTQTs7O21DQUlDQSxPQUFZQTtnQkFFckNBLGFBQWtCQSxJQUFJQTtnQkFDdEJBLFVBQVdBLDRCQUFpRkEseUJBQWtCQSxBQUFnRkE7K0JBQVFBLGdDQUFXQTs7O2dCQUVqTkEsNEJBQTRCQSxPQUFPQTs7Z0JBRW5DQSxJQUFJQSxPQUFPQTtvQkFFUEEsTUFBTUEsNEJBQWlGQSx3QkFBaUJBLEFBQWdGQTttQ0FBUUEsa0NBQWFBOzs7O2dCQUdqTkEsb0JBQW9CQTs7Z0JBRXBCQSxPQUFPQTs7OztnQkFvQlBBOztnQkFFQUEsMEJBQW1CQTs7Ozt3QkFFZkEsMkJBQTRCQTs7OztnQ0FFeEJBLDZCQUFXQSw4Q0FBcUNBLDRCQUEyQkEscUNBQTBCQSx3RUFBYUEsc0NBQXNCQTs7Ozs7Ozs7Ozs7Ozs7Z0JBS2hKQSxPQUFPQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkMzV0NBLFlBQW1CQSxPQUFXQTs7Z0JBRXRDQSxrQkFBYUE7Z0JBQ2JBLGFBQVFBO2dCQUNSQSxZQUFZQTtnQkFDWkEsa0JBQWtCQSxLQUFJQTtnQkFDdEJBLG1CQUFtQkEsS0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhDSGpCWUEsbUJBQVlBLFlBQWNBLFlBQWNBLFlBQWNBLFlBQWNBOzs7O2dCQU92R0EsZ0JBQVdBLEtBQUlBO2dCQUNmQSxnQkFBV0EsS0FBSUE7Ozs7O2dCQUtmQTs7Z0JBRUFBLHFCQUFxQkEsNEJBQXFFQSxxQkFBU0EsQUFBb0VBOytCQUFLQSxDQUFDQTs7Z0JBQzdLQSxrQkFBa0JBLDRCQUFxRUEscUJBQVNBLEFBQW9FQTsrQkFBS0E7OztnQkFFektBLElBQUlBO29CQUVBQSxpQkFBS0Esc0hBQ3JCQSx5RUFBaUVBLGtEQUF1QkEseURBQ3hGQSxtQ0FBMEJBLEFBQWtCQSxzQkFBOEJBLEFBQXNFQTttQ0FBS0E7eUVBQ3JKQSw2SEFDQUE7OztnQkFHWUE7Ozs7Ozs7O2dCQUVBQSxLQUFLQSxhQUFhQSxTQUFTQTtvQkFFdkJBOztvQkFFQUEsaUJBQUtBLHdGQUE4RUEsd0JBQUtBLEtBQUxBOzs7b0JBR25GQSxhQUFhQSxrQkFBa0JBLEFBQW9FQTsrQkFBS0Esa0JBQWlCQTsrQkFBbUJBLEFBQW1FQTsrQkFBS0E7OztvQkFFcE5BLElBQUlBO3dCQUNBQTs7O29CQUVKQSxLQUFLQSxXQUFXQSxJQUFJQSxlQUFlQTt3QkFFL0JBLGNBQWVBLDBCQUFPQSxHQUFQQTs7O3dCQUdmQSxJQUFJQSx3QkFBdUJBLG9EQUFxQkEsK0NBQXVCQSxLQUF2QkEsa0NBQStCQTs0QkFFM0VBLGdCQUFnQkEsa0JBQUtBLFdBQVdBLCtDQUF1QkEsS0FBdkJBOzRCQUNoQ0EsY0FBY0Esa0JBQUtBLFdBQVdBLENBQUNBLGlEQUF1QkEsS0FBdkJBLGdDQUE4QkE7OzRCQUU3REEsaUJBQW9CQSxzREFBaUNBLHFCQUFDQSxpREFBdUJBLEtBQXZCQSxnQ0FBOEJBOzRCQUNwRkEsZUFBa0JBLG9EQUErQkEscUJBQUNBLG1EQUF1QkEsS0FBdkJBLGdDQUE4QkEsK0RBQTBCQTs7NEJBRTFHQSxpQkFBS0EseUpBQWdKQSxZQUFXQTs7Ozs7d0JBS3BLQSxnQkFBZ0JBLGtCQUFLQSxXQUFXQTt3QkFDaENBLGNBQWNBLGtCQUFLQSxXQUFXQSxDQUFDQSw0QkFBMEJBOzt3QkFFekRBLFlBQWVBLHNEQUFpQ0EscUJBQUNBLDRCQUEwQkE7d0JBQzNFQSxVQUFhQSxvREFBK0JBLHFCQUFDQSw4QkFBMEJBLG9EQUFlQTs7d0JBRXRGQSxpQkFBS0EsK0RBQW9EQSx5QkFDN0VBLHlDQUFpQ0EsT0FBTUE7O3dCQUVuQkE7OztvQkFHSkE7OztnQkFHSkEsT0FBT0E7Ozs7Z0JBTVBBLEtBQUtBLGFBQWFBLFNBQVNBO29CQUV2QkEsMEJBQXlCQTs7Ozs0QkFFckJBLElBQUlBLGdEQUEyQkEsS0FBM0JBLCtCQUFrQ0EsZ0RBQTZCQSxLQUE3QkEsd0NBQXFDQTtnQ0FDdkVBLHlDQUFzQkEsS0FBdEJBOzs7Ozs7OztvQkFHUkEsMkJBQXlCQTs7Ozs0QkFFckJBLElBQUlBLGdEQUEyQkEsS0FBM0JBLCtCQUFrQ0EsZ0RBQTZCQSxLQUE3QkEsd0NBQXFDQTtnQ0FDdkVBLHlDQUFzQkEsS0FBdEJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkE4QlpBLElBQUlBLDZCQUF1QkE7b0JBQ3ZCQTs7OztnQkFHSkEsS0FBS0EsV0FBV0EsSUFBSUEscUJBQWdCQTtvQkFFaENBLHNCQUFTQTtvQkFDVEEsc0JBQVNBLGlCQUFpQkE7b0JBQzFCQSxzQkFBU0EscUJBQXFCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JBbUNsQ0E7b0JBRUlBOzs7O29CQUlBQSwyQkFBVUEsSUFBSUE7Ozs7O2dCQU1sQkEsY0FBZUE7O2dCQUVmQSxLQUFLQSxhQUFhQSxTQUFTQTtvQkFFdkJBLElBQUlBLGdEQUEyQkEsS0FBM0JBLCtCQUFrQ0EsZ0RBQTZCQSxLQUE3QkEsdUNBQW9DQTt3QkFDdEVBOzs7b0JBRUpBLG9CQUFvQkEsNEJBQXFFQSxxQkFBU0EsQUFBb0VBO21DQUFLQSxDQUFDQSxjQUFjQSwwQ0FBcUJBLEtBQXJCQSx5QkFBNEJBLDBDQUF1QkEsS0FBdkJBLGtDQUErQkE7bUNBQzNNQSxBQUFtRUE7K0JBQUtBLDBDQUFxQkEsS0FBckJBLHlCQUE0QkEsMENBQXVCQSxLQUF2QkE7OztvQkFFOUlBO29CQUNBQSxrQkFBa0JBOztvQkFFbEJBLEtBQUtBLFdBQVdBLElBQUlBLHNCQUFzQkE7Ozs7O3dCQU10Q0EsS0FBS0EsbUJBQWFBLHVDQUFjQSxHQUFkQSx5REFBc0NBLGFBQU1BLFlBQVVBLHdDQUFjQSxHQUFkQSx1REFBb0NBLFlBQU1BOzRCQUU5R0EsSUFBSUEsZ0RBQTZCQSxLQUE3QkEsaUNBQW9DQTtnQ0FFcENBLFdBQVNBLGlEQUE2QkEsS0FBN0JBO2dDQUNUQTs7OzRCQUdKQSxJQUFJQSw4Q0FBMkJBLEtBQTNCQSwrQkFBa0NBO2dDQUNsQ0E7Ozs7NEJBR0pBLElBQUlBLFlBQVVBLGVBQWVBLFlBQVVBLGdCQUFjQTtnQ0FDakRBOzs7NEJBRUpBLDhCQUE4QkEsNEJBQXFFQSxxQkFBY0EsQUFBb0VBOzsrQ0FBS0EsY0FBY0Esa0JBQWlCQSxPQUFPQSxxQkFBcUJBLGFBQVNBLHFEQUFnQkEscUJBQXFCQSxhQUFTQTs7Ozs0QkFFNVNBLElBQUlBO2dDQUNBQTs7OzRCQUVKQTs7NEJBRUFBLGlDQUFjQSxHQUFkQTs0QkFDQUEsaUNBQWNBLEdBQWRBLDhCQUErQkE7NEJBQy9CQSxpQ0FBY0EsR0FBZEEsa0NBQW1DQTs7NEJBRW5DQSxJQUFJQSxnQkFBZUE7Z0NBRWZBLGNBQWNBO2dDQUNkQSwyQkFBVUEsQUFBa0JBLDRCQUFxRUEscUJBQWNBLEFBQW9FQTsrQ0FBS0E7K0NBQTBCQSxBQUFtRUE7MkNBQUtBOzBDQUFtQ0EsQUFBc0VBOzJDQUFLQTtzRUFBcUJBO2dDQUM3WkEscUNBQXFDQSxvQ0FBcUVBLHFCQUFjQSxBQUFvRUE7K0NBQUtBOytDQUEwQkEsQUFBbUVBOzJDQUFLQTswSEFBbURBO2dDQUN0VkEsY0FBY0E7Z0NBQ2RBLCtDQUF1QkEsS0FBdkJBLGdDQUE4QkE7OzRCQUVsQ0E7Ozs7OztnQkFRWkEsdUJBQXVCQSw0QkFBcUVBLHFCQUFTQSxBQUFvRUE7K0JBQVdBLENBQUNBOzs7Z0JBRXJMQSxJQUFJQTtvQkFDQUE7OztnQkFFSkE7O2dCQUVBQSxPQUFPQTtvQkFFSEE7O29CQUVBQSx5QkFBeUJBO29CQUN6QkEsMkJBQTJCQTtvQkFDM0JBLEtBQUtBLFdBQVdBLElBQUlBLHdCQUF3QkE7d0JBRXhDQSxRQUFTQSx5QkFBaUJBO3dCQUMxQkE7d0JBQ0FBLEtBQUtBLGFBQWFBLFNBQVNBOzRCQUV2QkEscUJBQVdBLDJDQUFxQkEsS0FBckJBLHlCQUE0QkEsMENBQXVCQSxLQUF2QkE7O3dCQUUzQ0EsSUFBSUEsVUFBVUE7NEJBRVZBLHFCQUFxQkE7NEJBQ3JCQSx1QkFBdUJBOzs7b0JBRy9CQSxvQkFBcUJBLHlCQUFpQkE7Ozs7Ozs7Z0JBUzFDQSxjQUFlQTs7Z0JBRWZBLEtBQUtBLGFBQWFBLFNBQVNBOzs7O29CQUt2QkEseUJBQXlCQSw0QkFBcUVBLHFCQUFTQSxBQUFvRUE7bUNBQUtBLDBDQUFxQkEsS0FBckJBLHlCQUE0QkEsMENBQXVCQSxLQUF2QkEsa0NBQStCQSwrQ0FBZ0JBLENBQUNBOzs7b0JBRTVQQSxJQUFJQSxnREFBMkJBLEtBQTNCQSwrQkFBa0NBLGdEQUE2QkEsS0FBN0JBLHVDQUFvQ0EsK0NBQ3ZFQTt3QkFDQ0E7Ozs7Ozs7b0JBTUpBO29CQUNBQSxLQUFLQSxtQkFBYUEsZ0RBQTZCQSxLQUE3QkEsa0NBQW1DQSxZQUFVQSw4Q0FBMkJBLEtBQTNCQSw4QkFBaUNBO3dCQUU1RkEsSUFBSUEsaUJBQWdCQTs0QkFFaEJBLGVBQWVBOzs0QkFFZkEsdUJBQVVBOzRCQUNWQTs7O3dCQUdKQSx5QkFBeUJBLDRCQUFxRUEsMEJBQW1CQSxBQUFvRUE7OzJDQUFXQSxnREFBNkJBLEtBQTdCQSxrQ0FBcUNBLFlBQ25MQSw4Q0FBMkJBLEtBQTNCQSxnQ0FBbUNBLGFBQVNBOztzREFDOUJBLEFBQW1FQTttQ0FBS0EsMENBQXFCQSxLQUFyQkEseUJBQTRCQSwwQ0FBdUJBLEtBQXZCQTs7O3dCQUVwS0Esb0JBQXFCQSw0QkFBOEVBOzt3QkFFbkdBLElBQUlBLGlCQUFpQkE7NEJBQ2pCQTs7O3dCQUVKQSxnQ0FBZ0NBO3dCQUNoQ0EsNEJBQTRCQTt3QkFDNUJBOzt3QkFFQUEsdUJBQVVBOzt3QkFFVkE7Ozs7O2dCQU9SQSxLQUFLQSxhQUFhQSxTQUFTQTs7b0JBR3ZCQSxjQUFlQTs7O29CQUdmQSx5QkFBeUJBLDRCQUFxRUEscUJBQVNBLEFBQW9FQTttQ0FBS0EsMENBQXFCQSxLQUFyQkEseUJBQTRCQSwwQ0FBdUJBLEtBQXZCQSxrQ0FBK0JBLCtDQUFnQkEsQ0FBQ0E7bUNBQzFPQSxBQUFtRUE7K0JBQUtBLDBDQUFxQkEsS0FBckJBLHlCQUE0QkEsMENBQXVCQSxLQUF2QkE7OztvQkFFdEhBLElBQUlBLGdEQUEyQkEsS0FBM0JBLCtCQUFrQ0EsZ0RBQTZCQSxLQUE3QkEsdUNBQW9DQSwrQ0FBZ0JBLENBQUNBLHlDQUFzQkEsS0FBdEJBLDJCQUN4RkE7d0JBQ0NBOzs7b0JBRUpBOztvQkFFQUEsS0FBS0EsaUJBQVdBLGdEQUE2QkEsS0FBN0JBLGtDQUFtQ0EsVUFBUUEsZ0RBQTJCQSxLQUEzQkEsK0JBQWtDQSxtREFBY0E7O3dCQUd2R0EsSUFBSUE7NEJBRUFBLCtDQUF1QkEsS0FBdkJBLGdDQUE4QkE7NEJBQzlCQSxtQkFBUUE7NEJBQ1JBOzs7O3dCQUlKQSx3QkFBd0JBLDRCQUFxRUEsMEJBQW1CQSxBQUFvRUE7OzJDQUFLQSwwQ0FBdUJBLEtBQXZCQSw0QkFBK0JBLFVBQVFBLHdDQUFxQkEsS0FBckJBLDBCQUE2QkEsV0FBT0E7O29EQUNsUEEsQUFBbUVBO21DQUFLQSwwQ0FBdUJBLEtBQXZCQTs7d0JBQzFGQSwyQkFBVUEsZUFBa0JBLHlCQUFpQ0EsQUFBc0VBO3VDQUFLQSx3QkFBZ0JBLDBDQUF1QkEsS0FBdkJBOzRDQUFnQ0E7O3dCQUV4TEEsb0JBQXFCQTs7d0JBRXJCQSxJQUFJQSxpQkFBaUJBOzRCQUNqQkE7Ozt3QkFFSkEsZ0NBQWdDQTt3QkFDaENBLDRCQUE0QkE7d0JBQzVCQTs7d0JBRUFBLG1CQUFRQTs7d0JBRVJBOzs7OztnQkFPUkEsY0FBZUE7O2dCQUVmQSxLQUFLQSxhQUFhQSxTQUFTQTtvQkFFdkJBLElBQUlBLHlDQUFzQkEsS0FBdEJBO3dCQUVBQSxhQUFrQ0Esd0JBQW1CQSxLQUFLQSxnREFBNkJBLEtBQTdCQSxnQ0FBbUNBLDhDQUEyQkEsS0FBM0JBO3dCQUM3RkEsS0FBS0EsV0FBV0EsSUFBSUEsY0FBY0E7NEJBRTlCQSxlQUFPQTs0QkFDUEEsZUFBT0Esa0NBQXlCQTs0QkFDaENBLGVBQU9BLHNDQUE2QkEsZUFBT0E7Ozs7OzBDQU1QQSxLQUFTQSxXQUFlQSxTQUFhQTs7Z0JBRXJGQSxJQUFJQSxhQUFhQSxZQUFVQTtvQkFFdkJBLE9BQU9BLEtBQUlBOzs7Z0JBR2ZBLG1CQUFtQkEsNEJBQXFFQSxxQkFBU0EsQUFBb0VBOytCQUFLQSxDQUFDQSxjQUFjQSwwQ0FBdUJBLEtBQXZCQSw0QkFBK0JBLGFBQ2hMQSx3Q0FBcUJBLEtBQXJCQSwwQkFBNkJBOytCQUF1QkEsQUFBbUVBOzJCQUFLQSwwQ0FBdUJBLEtBQXZCQTs7Z0JBQ3BLQSxJQUFJQSxnQkFBZ0JBO29CQUVoQkE7b0JBQ0FBLE9BQU9BLHdCQUFtQkEsS0FBS0EsV0FBV0EsU0FBU0E7OztnQkFHdkRBLDRCQUE0QkEscURBQWtDQSxLQUFsQ0E7OztnQkFHNUJBO2dCQUNBQSx5QkFBYUE7Z0JBQ2JBLElBQUlBLG1CQUFrQkE7b0JBQ2xCQSx5QkFBYUE7O2dCQUNqQkEsc0JBQXNCQSw0QkFBcUVBLHFCQUFTQSxBQUFvRUE7K0JBQUtBLENBQUNBLGNBQWNBLDBDQUF1QkEsS0FBdkJBLDJCQUE4QkEsMEJBQXdCQSxxREFDeE1BLHdDQUFxQkEsS0FBckJBLDBCQUE2QkEsV0FBV0EsMkJBQUtBOzs7Z0JBRXZGQSxxREFBb0NBO2dCQUNwQ0EsMkJBQVVBLGlDQUF5QkE7Z0JBQ25DQSwyQkFBVUEsZUFBaUJBLHVCQUErQkEsQUFBc0VBOytCQUFLQTttQ0FBV0E7O2dCQUVoSkEsZ0JBQTJDQSxLQUFJQTs7O29CQUczQ0EsaUJBQXNDQSxLQUFJQTtvQkFDMUNBLGVBQWVBLElBQUlBLG9EQUFtQkEsdUJBQXVCQTtvQkFDN0RBLGtCQUF1Q0Esd0JBQW1CQSxLQUFLQSxXQUFXQSxTQUFTQTtvQkFDbkZBLElBQUlBLGVBQWVBO3dCQUVmQSxvQkFBb0JBOztvQkFFeEJBLGNBQWNBOztnQkFFbEJBLDBCQUErQkE7Ozs7d0JBRTNCQSxxQkFBMENBLEtBQUlBO3dCQUM5Q0EsbUJBQW1CQSxJQUFJQSxvREFBbUJBLFNBQVNBLFdBQVdBLHVEQUFvQ0EsS0FBcENBLHdDQUEyQ0E7d0JBQ3pHQSxtQkFBdUNBLHdCQUFtQkEsS0FBS0EsV0FBV0EsU0FBU0E7d0JBQ25GQSxJQUFJQSxnQkFBZUE7NEJBRWZBLHdCQUF3QkE7O3dCQUU1QkEsY0FBY0E7Ozs7OztpQkFFOUJBLDRCQUNZQSw2QkFBVUEsQUFBMEhBOytCQUFLQTs7O2dCQUV6SUEsT0FBT0EsNEJBQTRIQTs7O2dCQUtuSUEsY0FBZUE7O2dCQUVmQSxLQUFLQSxhQUFhQSxTQUFTQTtvQkFFdkJBLElBQUlBLHlDQUFzQkEsS0FBdEJBO3dCQUVBQSxzQkFBZ0JBLGdEQUE2QkEsS0FBN0JBO3dCQUNoQkEsY0FBY0EsOENBQTJCQSxLQUEzQkE7d0JBQ2RBOzt3QkFFQUEsS0FBS0Esd0JBQWdCQSxXQUFTQSxZQUFVQTs0QkFFcENBLHVCQUF1QkEsNEJBQXFFQSxxQkFBU0EsQUFBb0VBOzsrQ0FBS0EsQ0FBQ0EsY0FBY0EsbUNBQWdCQSxLQUFoQkEscUJBQXdCQSwwQ0FBdUJBLEtBQXZCQSw0QkFBK0JBLGdCQUFZQSxrQkFDcE5BLHdDQUFxQkEsS0FBckJBLDBCQUE2QkEsa0JBQVlBLGlCQUFTQTs7Ozs0QkFFOUZBLElBQUlBO2dDQUVBQTtnQ0FDQUE7Ozs0QkFHSkEsbUJBQW1CQTs0QkFDbkJBOzRCQUNBQSwyQkFBMkJBOzRCQUMzQkEsK0JBQStCQSxlQUFZQTs7NEJBRTNDQTs7NEJBRUFBLHVCQUFVQTs7NEJBRVZBLElBQUlBLG1CQUFrQkE7Z0NBRWxCQSwrQ0FBdUJBLEtBQXZCQSxnQ0FBOEJBLGVBQVlBO2dDQUMxQ0EsdUJBQVVBO2dDQUNWQTs7Ozs7OztnQkFTaEJBLFdBQVlBLElBQUlBLDJDQUFLQSwwQkFBYUE7Z0JBQ2xDQSxhQUFlQTtnQkFDZkEsOEJBQXlCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7dUNJN2VBQTttQ0FDSkE7Ozs0QkFHYkEsTUFBYUEsZUFBc0JBLHNCQUE0QkE7O2dCQUV2RUEsWUFBWUE7Z0JBQ1pBLHFCQUFxQkE7Z0JBQ3JCQSw0QkFBNEJBO2dCQUM1QkEsMEJBQTBCQTs7OztxQ0FHRkE7Z0JBRXhCQSxJQUFJQSxnQkFBZ0JBO29CQUNoQkEsTUFBTUEsSUFBSUEseUJBQWtCQSwrQ0FBK0NBOzs7Z0JBRS9FQSxJQUFJQSxDQUFDQSxzQ0FBY0EsVUFBZEE7b0JBQ0RBOzs7Z0JBRUpBLGVBQWVBLDZDQUFxQkEsVUFBckJBO2dCQUNmQSxlQUFlQSwyQ0FBbUJBLFVBQW5CQTs7Z0JBRWZBLGFBQWFBLGtCQUFLQSxXQUFXQTtnQkFDN0JBLGFBQWFBLGtCQUFLQSxXQUFXQTs7Z0JBRTdCQSxPQUFPQSw4Q0FBc0NBLGtDQUFPQSxxQkFBQ0EsYUFBV0EsMENBQTRCQSxrQ0FBT0EscUJBQUNBLGFBQVdBOzs7Ozs7Ozs7Ozs7Ozs7K0NDN0JuRkE7Ozs7Ozs2Q0FZS0E7b0JBRWpDQSw4QkFBU0E7O2lDQUlZQSxHQUFVQTs7b0JBRy9CQSxZQUFrQ0E7O29CQUVsQ0EsV0FBY0E7O29CQUVkQSxXQUFjQTs7b0JBRWRBLElBQUdBLGNBQWNBOzt3QkFHYkEsY0FBaUJBLGdCQUFrQkE7d0JBQ25DQSxPQUFPQSxtR0FBbUdBLDZEQUF1Q0EsNkNBQXdCQSw0QkFBb0JBO3dCQUM3TEEsdUJBQVFBLGlEQUFnREEsbUVBQTZDQTt3QkFDckdBOzt3QkFJQUEsT0FBT0EsdUJBQXNCQSw2Q0FBd0JBLDRCQUFvQkE7OztvQkFHN0VBLGtDQUFhQTs7d0NBR2dCQTtvQkFFN0JBLHlGQUFvQkE7O21EQUdzQkE7b0JBRTFDQSxRQUFRQTt3QkFFSkEsS0FBS0E7NEJBQ0RBO3dCQUNKQSxLQUFLQTs0QkFDREE7d0JBQ0pBLEtBQUtBOzRCQUNEQTs7O29CQUdSQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJDN0RhQSxNQUFXQTs7aUZBQXNCQSxNQUFNQTs7Ozt3Q0FFM0JBLFdBQTZCQTtnQkFFdERBLG9CQUFvQkEsNEJBQWlGQSxpQkFBVUEsQUFBZ0ZBOytCQUFTQSxTQUFTQSxnQkFBY0E7OztnQkFFL05BLElBQUdBO29CQUVDQSwyQkFBVUEsd0NBQXVDQSxlQUFtQkEsNEJBQXlGQSxrQkFBVUEsQUFBa0ZBO3VDQUFRQSwyQ0FBbUNBO3NFQUFnQ0EsOENBQXVDQSxnQkFBZ0JBOztvQkFJM1hBLDJCQUFVQSx1Q0FBc0NBLGVBQW1CQSw0QkFBeUZBLGtCQUFVQSxBQUFrRkE7dUNBQVFBLDJDQUFtQ0E7c0VBQWdDQSw4Q0FBdUNBLGdCQUFnQkE7OztnQkFHOVhBLE9BQU9BOzs7Ozs7Ozs7Ozs7O3NDQVN3QkEsYUFBK0JBLE1BQVdBO2dCQUV6RUEsSUFBSUE7b0JBQ0FBLE9BQU9BOzs7Z0JBRVhBLG9CQUFvQkE7Z0JBQ3BCQTtvQkFFSUEsZUFBZ0JBLDRCQUFrRkEsb0JBQXBEQSxrRUFBaUVBLDhCQUFpRkE7b0JBQ2hNQSwyQkFBVUEsMkJBQTBCQSxlQUFzQkEsNEJBQXNGQSxvQkFBWUEsQUFBK0VBO3VDQUFRQTtrREFBZUE7b0JBQ2xRQSxtQkFBbUJBLDRCQUFpRkEsa0JBQVdBLEFBQWdGQTttQ0FBUUEsZUFBY0EsTUFBTUEsOEJBQVFBLGFBQVlBLDRCQUFpRkEsdUJBQWdCQSxBQUFnRkE7MkNBQVFBLG9CQUFvQkEsTUFBTUE7OztvQkFDbGNBLHNCQUFzQkEsNEJBQWlGQSxtQkFBWUEsQUFBZ0ZBO21DQUFRQSxlQUFjQSxNQUFNQSw4QkFBUUE7O29CQUN2T0Esd0RBQXVDQTtvQkFDdkNBLGdCQUFnQkEsc0JBQWlCQSxjQUFjQTtvQkFDL0NBLHNEQUFxQ0E7Ozs7b0JBR3JDQSwyQkFBVUEsa0NBQWlDQSxhQUFNQTtvQkFDakRBLDJCQUFVQSxJQUFJQTtvQkFDZEEsTUFBTUE7O2dCQUVWQSxPQUFPQTs7c0NBR3lCQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBQbGFuIHBsYW47XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBsYXN0U2V0V2FzVGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNldElkO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2VsZWN0ZWREYXk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGRheUlkO1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmdbXSBkYXlzID0geyBcIm1vbmRheVwiLCBcInR1ZXNkYXlcIiwgXCJ3ZWRuZXNkYXlcIiwgXCJ0aHVyc2RheVwiLCBcImZyaWRheVwiIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidXRzID0gR2NsKFwidGVhY2hlci1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIHRydWUpOyB9O1xyXG5cclxuICAgICAgICAgICAgYnV0cyA9IEdjbChcInN0dWRlbnQtY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhidXRzW2ldLCBmYWxzZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwiYnV0LXRpbWUtc2V0XCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBjID0gaTtcclxuICAgICAgICAgICAgICAgIGJ1dHNbaV0uT25DbGljayArPSAoZSkgPT4geyBTb21lRGF5RWRpdEhvdXJzQ2xpY2soYnV0c1tjXSk7IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnNcIikuT25DbGljayA9IChlKSA9PiB7IFNhdmVIb3VyQ2hhbmdlKCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWhvdXJzLWNhbmNlbFwiKS5PbkNsaWNrID0gKGUpID0+IHsgUmVtb3ZlSG91ckluRGF5KCk7IFVwZGF0ZUxpc3RPZkRheXMoKTsgfTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInJ1blwiKS5PbkNsaWNrID0gKGUpID0+IHsgcGxhbi5DYWxjKCk7IEdpZChcIm91dHB1dFwiKS5Jbm5lckhUTUwgPSBwbGFuLkdlbmVyYXRlSFRNTCgpOyB9O1xyXG5cclxuICAgICAgICAgICAgLy8gVGVzdFxyXG4gICAgICAgICAgICBHaWQoXCJ0ZXN0XCIpLk9uQ2xpY2sgPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLypwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihcIlRlc3QgVGVhY2hlclwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIHRydWUsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAxNCAqIDYwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDIwICogNjAsIDAsIDE5ICogNjAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAxXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxNSAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE2ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDJcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDExICogNjAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsxOCAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAzXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE0ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDRcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMjMgKiA2MCArIDU5LCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICBcclxuICAgICAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKFwiVGVzdCBUZWFjaGVyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDFcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDEwICogNjAgKyAxMCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxMSAqIDYwICsgNTAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBwbGFuLkNhbGMoKTtcclxuICAgICAgICAgICAgICAgIEdpZChcIm91dHB1dFwiKS5Jbm5lckhUTUwgPSBwbGFuLkdlbmVyYXRlSFRNTCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgTG9nLkluaXRpYWxpemVXaXRoRGl2KEdpZChcImxvZ0RpdlwiKSBhcyBIVE1MRGl2RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgZnJvbSA9IChpbnQpKGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaW50IHRvID0gKGludCkoaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbSArIFBsYW4ubGVzc29uTGVuZ3RoID4gdG8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSB0bztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgUmVtb3ZlSG91ckluRGF5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFVwZGF0ZUxpc3RPZkRheXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRvIGFsbCBkYXlzOiBpZiB0aGVyZSBpcyBhdCBsZWFzdCB7UGxhbi5sZXNzb25MZW5ndGh9ICg1MCkgbWludXRlcyBiZXR3ZWVuIHR3byB0aW1lczogcmV0dXJuIHRpbWVzIGluIGZvcm1hdCBbXCJISDpNTSAtIEhIOk1NXCJdLCBlbHNlLCByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIlxyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtXCIgKyBkYXlzW2ldKS5Jbm5lckhUTUwgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldIC0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDwgUGxhbi5sZXNzb25MZW5ndGggPyBcIk5lbsOtIG5hc3RhdmVub1wiIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldKSArIFwiIC0gXCIgKyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhpbnQgbWludXRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBob3VycyA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChtaW51dGVzIC0gaG91cnMgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXQoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBudW0gPSBudW1iZXIuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgaWYgKG51bS5MZW5ndGggPT0gMSlcclxuICAgICAgICAgICAgICAgIG51bSA9IFwiMFwiICsgbnVtO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnQgR2lkKHN0cmluZyBpZCkge3JldHVybiBEb2N1bWVudC5HZXRFbGVtZW50QnlJZChpZCk7fVxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxDb2xsZWN0aW9uIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpO31cclxuICAgIH1cclxufSIsInVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3c7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBsZXNzb25MZW5ndGggPSA1MDsgLy8gNDUgKyA1IHBhdXNlXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnMgPSAzOyAvLyBCcmVhayBhZnRlciAzIGxlc3NvbnNcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoID0gMTU7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnRbXSBicmVha0FmdGVyTGVzc29uc1N0YXJ0ID0gbmV3IGludFtdIHsgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSwgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUgfTtcclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZW5lcmF0ZUhUTUwoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHMgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5vdFBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkKSk7XHJcbiAgICAgICAgICAgIHZhciBwb3NTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm90UG9zU3R1ZGVudHMuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWRhbmdlciBhbGVydC1kaXNtaXNzaWJsZSBmYWRlIHNob3dcXFwicm9sZT1cXFwiYWxlcnRcXFwiXCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHA+TmVwb2RhxZlpbG8gc2UgbmFqw610IG3DrXN0byBwcm8gezB9IHogezF9IMW+w6Frxa8gXCIsbm90UG9zU3R1ZGVudHMuQ291bnQoKSxzdHVkZW50cy5Db3VudCkrXHJcbnN0cmluZy5Gb3JtYXQoXCIoezB9KTwvcD5cIixTdHJpbmcuSm9pbihcIiwgXCIsIG5vdFBvc1N0dWRlbnRzLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSkpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJhbGVydFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlwiKStcclxuc3RyaW5nLkZvcm1hdChcIjxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj7Dlzwvc3Bhbj48L2J1dHRvbj48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0cmluZ1tdIGRheXMgPSB7IFwiUG9uZMSbbMOtXCIsIFwiw5p0ZXLDvVwiLCBcIlN0xZllZGFcIiwgXCLEjHR2cnRla1wiLCBcIlDDoXRla1wiIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHBvc3NlZFN0dWRlbnRzVG9kYXkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcInJvd1xcXCI+PGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPjxoMz57MH08L2gzPlwiLGRheXNbZGF5XSk7XHJcbiAgICAgICAgICAgICAgICAvLyA8ZGl2IGNsYXNzPVwiY2FyZCBjYXJkLWJvZHlcIj5QZXRyICgxMDowMCAtIDEwOjUwKTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwc3NkYXkgPSBwb3NTdHVkZW50cy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZERheSA9PSBkYXkpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5hc3NpZ25lZE1pbnV0ZXMpKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBzc2RheS5MZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgICAgICBzICs9IFwiPGk+TmEgdGVudG8gZGVuIG5lbsOtIG5pYyBuYXBsw6Fub3ZhbsOpaG88L2k+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBwc3NkYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjdXJyZW50ID0gcHNzZGF5W2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkU3R1ZGVudHNUb2RheSA9PSBicmVha0FmdGVyTGVzc29ucyAmJiBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gIT0gaW50Lk1heFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50IGJyZWFrRnJvbSA9IChpbnQpTWF0aC5GbG9vcihicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgYnJlYWtUbyA9IChpbnQpTWF0aC5GbG9vcigoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldICsgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGgpIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyBCcmVha0hGcm9tID0gYnJlYWtGcm9tLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gLSBicmVha0Zyb20gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nIEJyZWFrSFRvID0gYnJlYWtUby5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldICsgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggLSBicmVha1RvICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IHN0cmluZy5Gb3JtYXQoXCI8ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCIgc3R5bGU9XFxcImRpc3BsYXk6IGlubGluZTtcXFwiPjxzcGFuIHN0eWxlPVxcXCJmb250LXN0eWxlOiBpdGFsaWM7XFxcIj5QxZllc3TDoXZrYTwvc3Bhbj4gKHswfSAtIHsxfSk8L2Rpdj5cIixCcmVha0hGcm9tLEJyZWFrSFRvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzRnJvbSA9IChpbnQpTWF0aC5GbG9vcihjdXJyZW50LmFzc2lnbmVkTWludXRlcyAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IoKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzICsgbGVzc29uTGVuZ3RoKSAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoRnJvbSA9IGhvdXJzRnJvbS5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgLSBob3Vyc0Zyb20gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaFRvID0gaG91cnNUby5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGggLSBob3Vyc1RvICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIj57MH0gKFwiLGN1cnJlbnQubmFtZSkrXHJcbnN0cmluZy5Gb3JtYXQoXCJ7MH0gLSB7MX0pPC9kaXY+XCIsaEZyb20saFRvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2VkU3R1ZGVudHNUb2RheSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gXCI8L2Rpdj48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOT1RFOiBJIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2FsYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciB0ZWFjaGVyIGluIHRlYWNoZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFVzZXIgc3R1ZGVudCBpbiBzdHVkZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQuZGF5c0F2YWlsYWJsZVtkYXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBIT1cgVEhJUyBXT1JLUzpcclxuXHJcblxyXG4gICAgICAgICAgICAvLyAxLjApIFNldCBzdGFydCB0aW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lIG9mIHRoZSBkYXlcclxuICAgICAgICAgICAgLy8gMS4xKSBGaW5kIHN0dWRlbnQgd2hvIGhhcyBzdGFydGluZyB0aW1lIHRoZSBzYW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lLiBJZiB5ZXMsIHBvcyBhbmQgcmVwZWF0IDEpIDQ1IG1pbnV0ZXMgbGF0ZXIuXHJcbiAgICAgICAgICAgIC8vICAgICAgSWYgbm90LCBtb3ZlIGJ5IDUgbWludXRlcyBhbmQgdHJ5IGl0IGFnYWluIHdpdGggYWxsIHN0dWRlbnRzLiBJZiBoaXQgdGVhY2hlcidzIGVuZCB0aW1lLCBtb3ZlIHRvIG5leHQgZGF5XHJcblxyXG4gICAgICAgICAgICAvLyBPUFRJTUFMSVpBVElPTjogQ2hlY2sgaWYgYm90aCB0ZWFjaGVyIGFuZCBzdHVkZW50cyBoYXZlIHNvbWUgbWludXRlcyBpbiBjb21tb24uIElmIG5vdCwgc2tpcCB0aGlzIGRheVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYWxsIHN0dWRlbnRzIGFyZSBwb3NpdGlvbmVkLCBlbmQuIElmIG5vdCwgaGVhZCB0byBzdGVwIDJcclxuXHJcbiAgICAgICAgICAgIC8vIDIuMCkgSSBoYXZlIHNvbWUgc3R1ZGVudHMgd2l0aG91dCBhc3NpZ25lZCBob3Vycy4gUGljayBzdHVkZW50IHdpdGggbGVhc3QgcG9zc2libGUgaG91cnMuIEZpbmQgYWxsXHJcbiAgICAgICAgICAgIC8vICAgICAgaG91cnMgd2hlcmUgSSBjYW4gcG9zIHRoaXMgc3R1ZGVudCBpbiBhbGwgZGF5cy5cclxuICAgICAgICAgICAgLy8gMi4xKSBDaG9vc2UgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBsZWFzdCB1bmFzc2lnbmVkIHN0dWRlbnRzIGNhbiBnby4gQWZ0ZXIgdGhhdCwgY2hvb3NlIHBvc2l0aW9uIHdoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgaXMgc3R1ZGVudCB3aXRoIG1vc3QgZnJlZSB0aW1lXHJcbiAgICAgICAgICAgIC8vIDIuMikgU3dhcCB0aG9zZSBzdHVkZW50c1xyXG4gICAgICAgICAgICAvLyAyLjMpIFJlcGVhdC4gSWYgYWxyZWFkeSByZXBlYXRlZCBOIHRpbWVzLCB3aGVyZSBOIGlzIG51bWJlciBvZiB1bmFzc2lnbmVkIHN0dWRlbnRzIGF0IHRoZSBiZWdnaW5pbmcgb2YgcGhhc2UgMixcclxuICAgICAgICAgICAgLy8gICAgICBlbmQsIHNob3cgYWxsIHBvc2l0aW9uZWQgc3R1ZGVudHMgYW5kIHJlcG9ydCBmYWlsdXJlXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZWFjaGVycy5Db3VudCAhPSAxIHx8IHN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBSZXNldCBwcmV2aW91cyBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWREYXkgPSAtMTtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkTWludXRlcyA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJzdCBzdGFnZVxyXG4gICAgICAgICAgICAvL1RyeVRvUG9zQWxsU3R1ZGVudHNWZXIyKCk7XHJcbiAgICAgICAgICAgIC8vIFNlY29uZCBzdGFnZVxyXG4gICAgICAgICAgICAvL1Bvc05vdFBvc3NlZFN0dWRlbnRzKCk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIE9SIEkgY291bGQgZG8gaXQgdGhpcyB3YXk6XHJcblxyXG4gICAgICAgICAgICAvLyAxICAgICAgICAgICAgRm9yIGFsbCBkYXlzIHdoZXJlIGF0IGxlYXN0IDEgdGVhY2hlciArIDEgc3R1ZGVudCBoYXMgdGltZSBhbmQgc29tZW9uZSBpcyBub3QgYXNzaWduZWQgeWV0XHJcbiAgICAgICAgICAgIC8vIDEuMSAgICAgICAgICBQb3MgMyBzdHVkZW50cyB0aGlzIHdheTogUG9zIHN0dWRlbnQgdGhhdCBjYW4gYmUgdGhlcmUgdGhlIGVhcmxpZXN0IHRpbWUuIElmIHRoZXJlIGlzIHNvbWVvbmUsIHRoYXQgY2FuIGJlIHRoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICA8NTAgbWludXRlcyBhZnRlciB0aGUgc3R1ZGVudCBhbmQgaGFzIGxlc3MgdGltZSwgcGxhY2UgaGltIGluc3RlYWRcclxuICAgICAgICAgICAgLy8gMS4yICAgICAgICAgIFBsYWNlIGEgYnJlYWtcclxuICAgICAgICAgICAgLy8gMS4zICAgICAgICAgIFBsYWNlIGFzIG1hbnkgc3R1ZGVudHMgYXMgeW91IGNhblxyXG5cclxuICAgICAgICAgICAgLy8gMiAgICAgICAgICAgIEZvciBhbGwgdW5hc3NpZ25lZCBzdHVkZW50czpcclxuICAgICAgICAgICAgLy8gMi4xICAgICAgICAgIEdldCBhbGwgc3R1ZGVudHMgdGhhdCBhcmUgYmxvY2tpbmcgaGltLiBEbyB0aGlzIGZvciBhbGwgKG9yZGVyZWQgYnkgbnVtYmVyIG9mIHRpbWUpIG9mIHRoZW0gdW5sZXNzIHRoZSBzdHVkZW50IGlzIHBvc3NlZDpcclxuICAgICAgICAgICAgLy8gMi4xLjEgICAgICAgIFN3YXAgdGhlc2Ugc3R1ZGVudHMuIFJlbWVtYmVyIHRvIG1vdmUgb3RoZXIgc3R1ZGVudHMgYmVoaW5kIGhpbSBpZiBuZWNjZXNzYXJ5LiBCZSBjYXJlZnVsIGlmIHNvbWVvbmUgbG9zZXMgcG9zaXRpb24gYmVjYXVzZSBvZiB0aGlzXHJcbiAgICAgICAgICAgIC8vIDIuMS4yICAgICAgICBJZiB0aGVzZSBzd2FwcGVkIHN0dWRlbnRzICh0aGF0IGRvbid0IGhhdmUgdGltZSBub3cpIGRvbid0IGhhdmUgW2RpcmVjdF0gcGxhY2UgdG8gc3RheSwgcmV2ZXJ0IGNoYW5nZXNcclxuICAgICAgICAgICAgLy8gMi4xLjMgICAgICAgIEVsc2UsIHBsYWNlIHN0dWRlbnRzIHRoZXJlIGFuZCBnbyBiYWNrIHRvIFsyXVxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vUG9zU3R1ZGVudHMoKTtcclxuICAgICAgICAgICAgLy9JRG9udENhcmVKdXN0UG9zc1N0dWRlbnRzKCk7IC8vIFRISVMgV0FTTlQgQ09NTUVOVEVEXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIFVTSU5HIEZMT1dTOlxyXG5cclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERvSXRVc2luZ0Zsb3dzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKEV4Y2VwdGlvbiBleClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKGV4LCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPCBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzVG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgcG9zc2VkSG91cnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgaW50IG1pbnV0ZUJyZWFrID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50c1RvZGF5Lkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IE11emUgc2Ugc3RhdCwgemUgdGVuIHN0dWRlbnQgcyBuZWptaW4gdmVsbnlobyBjYXN1IGJ1ZGUgbWVybW9tb2NpIHZlcHJlZHUgYSBidWRlIGJsb2tvdmF0IG1pc3RvIHBybyBqaW55aG8sIGkga2R5eiBieSBzZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHYgcG9ob2RlIHZlc2VsIGplc3RlIGRvemFkdS4gVHJlYmEgQSBtYSBtaW4gY2FzdSBuZXogQi4gQTogMTI6MzAtMTU6MDAsIEI6IDEyOjAwLTE3OjAwLCB2eXNsZWRlayBidWRlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQTogMTI6MzAtMTM6MjAsIEI6IDEzOjIwLTE0OjEwIE1JU1RPIEIgOjEyOjAwIC0gMTI6NTAsIEE6IDEyOjUwLTEzOjQwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZSA+PSBtaW51dGVCcmVhayAmJiBtaW51dGUgPD0gbWludXRlQnJlYWsgKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzSW5UaGlzVGltZUZyYW1lID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCAmJiB4LmFzc2lnbmVkRGF5ID09IGRheSAmJiB4LmFzc2lnbmVkTWludXRlcyA+PSBtaW51dGUgLSBsZXNzb25MZW5ndGggJiYgeC5hc3NpZ25lZE1pbnV0ZXMgPD0gbWludXRlICsgbGVzc29uTGVuZ3RoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkSG91cnMgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzID0gaW50Lk1pblZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKFN0cmluZy5Kb2luKFwiLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4LmFzc2lnbmVkTWludXRlcykpLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVPZkxhc3RQb3NzZWRTdHVkZW50VG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHguYXNzaWduZWRNaW51dGVzKSkuVG9BcnJheSgpWzJdLmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZUJyZWFrID0gbWludXRlT2ZMYXN0UG9zc2VkU3R1ZGVudFRvZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldID0gbWludXRlQnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUG9zTm90UG9zc2VkU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHVucG9zc2VkU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gIXN0dWRlbnQuYXNzaWduZWQpKS5Ub0xpc3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1bnBvc3NlZFN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBib29sIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoY2hhbmdlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgb25lIG9mIHVucG9zZWQgc3R1ZGVudHMgd2l0aCBsb3dlc3QgbnVtYmVyIG9mIHBvc3NpYmxlIGhvdXJzXHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudE1pbnV0ZXMgPSBpbnQuTWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHVucG9zc2VkU3R1ZGVudHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIHMgPSB1bnBvc3NlZFN0dWRlbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgKz0gcy5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHMubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZXMgPCBsb3dlc3RTdHVkZW50TWludXRlcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRNaW51dGVzID0gbWludXRlcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBVc2VyIHNlbGVjdFN0dWRlbnQgPSB1bnBvc3NlZFN0dWRlbnRzW2xvd2VzdFN0dWRlbnRJbmRleF07XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFRyeVRvUG9zQWxsU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gQXNzdW1pbmcgSSBoYXZlIGp1c3Qgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gRm9yIGFsbCBkYXlzLCBza2lwIGRheSBpZiBlaXRoZXIgYWxsIHN0dWRlbnRzIG9yIHRlYWNoZXIgYXJlIGJ1c3lcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIHN0dWRlbnRzIHRoYXQgaGF2ZSBhdCBsZWFzdCA1MG1pbnMgdGltZSB0b2RheSBhbmQgc3RpbGwgZG9uJ3QgaGF2ZSBhbnl0aGluZyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzRm9yVGhpc0RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCAmJiAheC5hc3NpZ25lZCkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBhbGwgdGhlIHRlYWNoZXIncyBtaW51dGVzIHRvZGF5XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07IG1pbnV0ZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldOyBtaW51dGUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNFbGFwc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG91cnNFbGFwc2VkID0gaW50Lk1pblZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1Rlcm0gPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0ZvclRoaXNEYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gbWludXRlICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjaG9zZW5TdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNJblRoaXNUZXJtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNob3NlblN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gbWludXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBsZXNzb25MZW5ndGggLSA1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFBvc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBzdHVkZW50cyB0aGF0IGhhdmUgYXQgbGVhc3QgNTBtaW5zIHRpbWUgdG9kYXkgYW5kIHN0aWxsIGRvbid0IGhhdmUgYW55dGhpbmcgYXNzaWduZWRcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0ZvclRoaXNEYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGggJiYgIXguYXNzaWduZWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAhdGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0gfHwgLy8gSWYgdGhlIHRlYWNoZXIgZG9uJ3QgaGF2ZSBmdWxsIDUwIG1pbnV0ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgc3R1ZGVudHNGb3JUaGlzRGF5Lkxlbmd0aCA9PSAwKSAvLyBPciBpZiB0aGVyZSBpcyBubyBzdHVkZW50IHdpdGggYXQgbGVhc3QgNTAgbWludHVlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gR28gdGhydSBhbGwgdGVhY2hlciBob3Vyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdGltZSA9IHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgdGltZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gbGVzc29uTGVuZ3RoOyB0aW1lICs9IDUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0cyB0YWtlIGEgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkID09IDMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBzdHVkZW50IGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0F2YWlsYWJsZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzRm9yVGhpc0RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHRpbWUgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA+PSB0aW1lICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKTsgLy8gVE9ETzogS2R5eiBqc291IGR2YSBzZSBzdGVqbnltYSBob2RpbmFtYSwgdXByZWRub3N0bml0IHRvaG8sIGtkbyBtYSBtaW4gY2FzdVxyXG4gICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShTdHJpbmcuSm9pbihcIiwgXCIsIHN0dWRlbnRzQXZhaWxhYmxlLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSArIFwiOiBcIiArIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGNob3NlblN0dWRlbnQgPSBzdHVkZW50c0F2YWlsYWJsZS5GaXJzdE9yRGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvc2VuU3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUgKz0gbGVzc29uTGVuZ3RoIC0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBCcnV0ZUZvcmNlU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIuZGF5c0F2YWlsYWJsZVtkYXldKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiByZXN1bHQgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0sIHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0sIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgcmVzdWx0LkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uc3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXS5zdHVkZW50LmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uc3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSByZXN1bHRbaV0ubWludXRlc0Zyb207XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiBCcnV0ZUZvcmNlU3R1ZGVudHMoaW50IGRheSwgaW50IHN0YXJ0VGltZSwgaW50IGVuZFRpbWUsIGludCBzdHVkZW50c1Bvc3NlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFRpbWUgPj0gZW5kVGltZSAtIGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHN0YXJ0U3R1ZGVudCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gc3RhcnRUaW1lICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIDw9IGVuZFRpbWUpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0U3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gNTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50IHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSA9IHN0YXJ0U3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSArPSBsZXNzb25MZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChzdHVkZW50c1Bvc3NlZCA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSBicmVha0FmdGVyTGVzc29uc0xlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGFub3RoZXJTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPiBzdGFydFN0dWRlbnRTdGFydFRpbWUgLSBsZXNzb25MZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8PSBlbmRUaW1lICYmIHggIT0gc3RhcnRTdHVkZW50KSk7XHJcblxyXG4gICAgICAgICAgICBMb2cuV3JpdGUoXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgTG9nLldyaXRlKHN0YXJ0U3R1ZGVudC5uYW1lICsgXCIsXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgTG9nLldyaXRlKFN0cmluZy5Kb2luKFwiLFwiLCBhbm90aGVyU3R1ZGVudHMuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50Pj4gcHJlUmVzdWx0ID0gbmV3IExpc3Q8TGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+PigpO1xyXG5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IHBvc3NSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzUmVzdWx0LkFkZChuZXcgQnJ1dGVGb3JjZWRTdHVkZW50KHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSwgc3RhcnRTdHVkZW50KSk7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gbmV3U3R1ZGVudHMgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdTdHVkZW50cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NSZXN1bHQuQWRkUmFuZ2UobmV3U3R1ZGVudHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJlUmVzdWx0LkFkZChwb3NzUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgYW5vdGhlclN0dWRlbnQgaW4gYW5vdGhlclN0dWRlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gcG9zc2libGVSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGQobmV3IEJydXRlRm9yY2VkU3R1ZGVudChNYXRoLk1heChzdGFydFRpbWUsIGFub3RoZXJTdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pLCBhbm90aGVyU3R1ZGVudCkpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IG5ld1N0dWRlbnRzID0gQnJ1dGVGb3JjZVN0dWRlbnRzKGRheSwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdHVkZW50c1Bvc3NlZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3U3R1ZGVudHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGRSYW5nZShuZXdTdHVkZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmVSZXN1bHQuQWRkKHBvc3NpYmxlUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5TeXN0ZW0uTGlucS5FbnVtZXJhYmxlLk9yZGVyQnlEZXNjZW5kaW5nPGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50PixpbnQ+KFxyXG4gICAgICAgICAgICBwcmVSZXN1bHQsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5CcnV0ZUZvcmNlZFN0dWRlbnQ+LCBpbnQ+KSh4ID0+IHguQ291bnQpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50Pj4ocHJlUmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBJRG9udENhcmVKdXN0UG9zc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRUaW1lID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBlbmRUaW1lID0gdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3R1ZGVudHNQb3NzZWQgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSAwOyBtaW51dGUgPCBlbmRUaW1lIC0gc3RhcnRUaW1lOylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1JpZ2h0Tm93ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHguZGF5c0F2YWlsYWJsZVtkYXldICYmIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBzdGFydFRpbWUgKyBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldID49IHN0YXJ0VGltZSArIG1pbnV0ZSArIGxlc3Nvbkxlbmd0aCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUmlnaHROb3cuQ291bnQoKSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudFRvUG9zID0gc3R1ZGVudHNSaWdodE5vdy5GaXJzdCgpOyAvLyBUT0RPOiBDaG9vc2Ugc29tZW9uZSBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudFRvUG9zLmFzc2lnbmVkTWludXRlcyA9IHN0YXJ0VGltZSArIG1pbnV0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gbGVzc29uTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUG9zc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSBzdGFydFRpbWUgKyBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1Bvc3NlZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRG9JdFVzaW5nRmxvd3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRmxvdyBmbG93ID0gbmV3IEZsb3codGVhY2hlcnNbMF0sIHN0dWRlbnRzKTtcclxuICAgICAgICAgICAgaW50W10gYnJlYWtzID0gZmxvdy5HZXRSZXN1bHQoKTtcclxuICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydCA9IGJyZWFrcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJuYWwgc3RydWN0IEJydXRlRm9yY2VkU3R1ZGVudFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgbWludXRlc0Zyb207XHJcbiAgICAgICAgcHVibGljIFVzZXIgc3R1ZGVudDtcclxuXHJcbiAgICAgICAgcHVibGljIEJydXRlRm9yY2VkU3R1ZGVudChpbnQgbWludXRlc0Zyb20sIFVzZXIgc3R1ZGVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb20gPSBtaW51dGVzRnJvbTtcclxuICAgICAgICAgICAgdGhpcy5zdHVkZW50ID0gc3R1ZGVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBDYXBhY2l0eTtcclxuICAgICAgICBwcml2YXRlIGludCBjdXJyZW50RmxvdztcclxuICAgICAgICBwdWJsaWMgTm9kZSBGcm9tO1xyXG4gICAgICAgIHB1YmxpYyBOb2RlIFRvO1xyXG5cclxuICAgICAgICBwdWJsaWMgRWRnZShpbnQgY2FwYWNpdHksIGludCBjdXJyZW50RmxvdywgTm9kZSBmcm9tLCBOb2RlIHRvKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2FwYWNpdHkgPSBjYXBhY2l0eTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RmxvdyA9IGN1cnJlbnRGbG93O1xyXG4gICAgICAgICAgICBGcm9tID0gZnJvbTtcclxuICAgICAgICAgICAgVG8gPSB0bztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIGludCBHZXRDdXJyZW50RmxvdyhJRW51bWVyYWJsZTxOb2RlPiBjdXJyZW50UGF0aCwgRmxvdyBmbG93LCBzdHJpbmcgaW5mbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50RmxvdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgU2V0Q3VycmVudEZsb3coaW50IG5ld1ZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudEZsb3cgPSBuZXdWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3dcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZsb3dcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgTGlzdDxOb2RlPiBOb2RlcyB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBVc2VyIHRlYWNoZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFVzZXI+IHN0dWRlbnRzO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBTdHVkZW50IG5hbWUgbXVzdCBOT1QgY29udGFpbiB0aGlzIGNoYXIgLT4gOlxyXG4gICAgICAgIHB1YmxpYyBGbG93KFVzZXIgdGVhY2hlciwgTGlzdDxVc2VyPiBzdHVkZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhY2hlciA9IHRlYWNoZXI7XHJcbiAgICAgICAgICAgIHRoaXMuc3R1ZGVudHMgPSBzdHVkZW50cztcclxuICAgICAgICAgICAgdGhpcy5Ob2RlcyA9IG5ldyBMaXN0PE5vZGU+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAgICAgLy8vIEdldHMgcmVzdWx0IHVzaW5nIGZsb3dzLiBUaGlzIG1ldGhvZCB3aWxsIHNldCBzdHVkZW50IGFzc2lnbmVkIHRpbWVzIGFuZCByZXR1cm4gYXJyYXkgb2YgbWludXRlcywgd2hlbiBpcyBicmVhayB0aW1lIGVhY2ggZGF5XHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBHZXRSZXN1bHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50W10gYnJlYWtzID0gbmV3IGludFs1XTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoc3RyaW5nLkZvcm1hdChcIj09PT09PT09PT09PT09PT09PT1EQVk6IHswfT09PT09PT09PT09PT09XCIsZGF5KSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgQnVpbGRHcmFwaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgU3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkRvbmUuLi5cIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzVG9kYXkgPSBHZXRSZXN1bHRGcm9tR3JhcGgoZGF5KTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlIHRoZW4gdGhyZWUgc3R1ZGVudHMgdG9kYXk6XHJcbiAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNUb2RheS5Db3VudCA+IDMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBmaXJzdCB0aHJlZSBzdHVkZW50IHRpbWVzXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIEFwcGx5U3R1ZGVudChzdHVkZW50c1RvZGF5W2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEaXNhYmxlIG1pbnV0ZXMgYW5kIHJlY29yZCBicmVhayB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtzW2RheV0gPSBzdHVkZW50c1RvZGF5WzJdLnRpbWVTdGFydCArIDUwO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGFnYWluIChyZW1vdmUgZmlyc3QgdHdvIHN0dWRlbnRzIGFuZCB0aGVpciB0aW1lcylcclxuICAgICAgICAgICAgICAgICAgICBCdWlsZEdyYXBoKGRheSwgYnJlYWtzW2RheV0sIGJyZWFrc1tkYXldICsgUGxhbi5icmVha0FmdGVyTGVzc29uc0xlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgU3RhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5ID0gR2V0UmVzdWx0RnJvbUdyYXBoKGRheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtzW2RheV0gPSBpbnQuTWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgYWxsIHN0dWRlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChBc3NpZ25tZW50UHJldmlldyByZXN1bHQgaW4gc3R1ZGVudHNUb2RheSkgQXBwbHlTdHVkZW50KHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIkJyZWFrOiBcIiArIFN0cmluZy5Kb2luPGludD4oXCIsIFwiLCBicmVha3MpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnJlYWtzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEJ1aWxkR3JhcGgoaW50IGRheSwgaW50IGJhbm5lZFRpbWVzcGFuRnJvbSA9IC0xLCBpbnQgYmFubmVkVGltZXNwYW5UbyA9IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTm9kZXMuQ2xlYXIoKTtcclxuICAgICAgICAgICAgLy8gQWRkIHJvb3Qgbm9kZVxyXG4gICAgICAgICAgICBOb2RlIHJvb3QgPSBuZXcgTm9kZShcIklucHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLklucHV0KTtcclxuICAgICAgICAgICAgTm9kZXMuQWRkKHJvb3QpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGFsbCBzdHVkZW50cyBub2Rlc1xyXG4gICAgICAgICAgICBmb3JlYWNoIChVc2VyIHN0dWRlbnQgaW4gc3R1ZGVudHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdHVkZW50LmFzc2lnbmVkIHx8ICFzdHVkZW50LmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBFcnJvciB3aGVuIG11bHRpcGxlIHN0dWRlbnRzIHdpdGggc2FtZSBuYW1lXHJcbiAgICAgICAgICAgICAgICBOb2RlIHN0dWRlbnROb2RlID0gbmV3IE5vZGUoXCJTdHVkZW50OlwiICsgc3R1ZGVudC5uYW1lLCAtMSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIklucHV0XCIsIHN0dWRlbnROb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGFyZSB0aW1lIGNodW5rIG5vZGVcclxuICAgICAgICAgICAgTm9kZSB0aW1lQ2h1bmsgPSBuZXcgTm9kZShcIlRpbWVDaHVua1wiLCAtMSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBvY2N1cGllZFRpbWVzVG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5hc3NpZ25lZERheSA9PSBkYXkpKS5TZWxlY3Q8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50Pikoc3R1ZGVudCA9PiBzdHVkZW50LmFzc2lnbmVkTWludXRlcykpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGFsbCB0aW1lcyBub2Rlc1xyXG4gICAgICAgICAgICBmb3IgKGludCB0aW1lID0gMDsgdGltZSA8IDI0ICogNjA7IHRpbWUgKz0gNSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHRpbWUgaXMgYmFubmVkIG9yIHNvbWVvbmUgYWxyZWFkeSBwb3NpdGlvbmVkIHVzZWQgdGhlIHRpbWUsIHNraXAgdG8gbmV4dCB0aW1lXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRpbWUgPj0gYmFubmVkVGltZXNwYW5Gcm9tICYmIHRpbWUgPD0gYmFubmVkVGltZXNwYW5UbykgfHxcclxuICAgICAgICAgICAgICAgICAgICBvY2N1cGllZFRpbWVzVG9kYXkuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8aW50LCBib29sPikob2NjVGltZSA9PiBNYXRoLkFicyhvY2NUaW1lIC0gdGltZSkgPCA1MCkpLkNvdW50KCkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gdGltZSAmJiB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gUGxhbi5sZXNzb25MZW5ndGggPj0gdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzQXRUaGlzVGltZSA9IC8qIFN0dWRlbnRzIHRoYXQgaGF2ZSB0aW1lIHJpZ2h0IG5vdyAqLyBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gIXN0dWRlbnQuYXNzaWduZWQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQuZGF5c0F2YWlsYWJsZVtkYXldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gdGltZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIFBsYW4ubGVzc29uTGVuZ3RoID49IHRpbWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZSB0aW1lTm9kZSA9IG5ldyBOb2RlKFwiVGltZTpcIiArIHRpbWUsIHRpbWUsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciBzdHVkZW50IGluIHN0dWRlbnRzQXRUaGlzVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIlN0dWRlbnQ6XCIgKyBzdHVkZW50Lm5hbWUsIHRpbWVOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgQWRkTm9kZUFmdGVyKFwiVGltZTpcIiArIHRpbWUsIHRpbWVDaHVuayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvbm5lY3QgVGltZSBDaHVuayB3aXRoIG91dHB1dFxyXG4gICAgICAgICAgICBOb2RlIG91dHB1dCA9IG5ldyBOb2RlKFwiT3V0cHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLk91dHB1dCk7XHJcbiAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIlRpbWVDaHVua1wiLCBvdXRwdXQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hhbmdlIGVkZ2UgYmV0d2VlbiBUaW1lQ2h1bmsoTm9kZSkgYW5kIE91dHB1dCB0byBUaW1lQ2h1bmsoRWRnZSlcclxuICAgICAgICAgICAgVGltZUNodW5rIHRpbWVDaHVua0VkZ2UgPSBuZXcgVGltZUNodW5rKHRpbWVDaHVuaywgb3V0cHV0KTtcclxuICAgICAgICAgICAgdGltZUNodW5rLk91dHB1dEVkZ2VzLkNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRpbWVDaHVuay5PdXRwdXRFZGdlcy5BZGQodGltZUNodW5rRWRnZSk7XHJcbiAgICAgICAgICAgIG91dHB1dC5JbnB1dEVkZ2VzLkNsZWFyKCk7XHJcbiAgICAgICAgICAgIG91dHB1dC5JbnB1dEVkZ2VzLkFkZCh0aW1lQ2h1bmtFZGdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBZGROb2RlQWZ0ZXIoc3RyaW5nIGlkZW50aWZpZXIsIE5vZGUgbmV3Tm9kZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbm9kZSBpbiBOb2RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuSWRlbnRpZmllciA9PSBpZGVudGlmaWVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIEVkZ2UgbmV3RWRnZSA9IG5ldyBFZGdlKDEsIDAsIG5vZGUsIG5ld05vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuT3V0cHV0RWRnZXMuQWRkKG5ld0VkZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld05vZGUuSW5wdXRFZGdlcy5BZGQobmV3RWRnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFOb2Rlcy5Db250YWlucyhuZXdOb2RlKSlcclxuICAgICAgICAgICAgICAgIE5vZGVzLkFkZChuZXdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTdGFydCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBXaGlsZSB3ZSBhcmUgY3JlYXRpbmcgbmV3IGZsb3csIGtlZXAgZG9pbmcgaXRcclxuICAgICAgICAgICAgd2hpbGUgKENyZWF0ZU5ld0Zsb3coKSkgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHZhbHVlOiBkaWQgd2UgY3JlYXRlIG5ldyBmbG93P1xyXG4gICAgICAgIHByaXZhdGUgYm9vbCBDcmVhdGVOZXdGbG93KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIExldCdzIGNyZWF0ZSBkaWN0aW9uYXJ5IG9mIE5vZGUgOiBTb3VyY2VOb2RlXHJcbiAgICAgICAgICAgIC8vICArLS0tLSstLS0tKy0tLS0rLS0tLS0rLS0tLS0rXHJcbiAgICAgICAgICAgIC8vICB8IEExIHwgQTIgfCBCMSB8IFRDSCB8IE9VVCB8IFxyXG4gICAgICAgICAgICAvLyAgKy0tLS0rLS0tLSstLS0tKy0tLS0tKy0tLS0tK1xyXG4gICAgICAgICAgICAvLyAgfCBJICB8IEkgIHwgQTEgfCBCMSAgfCBUQ0ggfFxyXG4gICAgICAgICAgICAvLyAgKy0tLS0rLS0tLSstLS0tKy0tLS0tKy0tLS0tK1xyXG5cclxuICAgICAgICAgICAgRGljdGlvbmFyeTxOb2RlLCBOb2RlPiBGbG93UGF0aCA9IG5ldyBEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+KE5vZGVzLkNvdW50KTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDE7IGkgPCBOb2Rlcy5Db3VudDsgaSsrKSBGbG93UGF0aC5BZGQoTm9kZXNbaV0sIG51bGwpOyAvLyBBZGQgYWxsIG5vZGVzIGludG8gRmxvd1BhdGggIWV4Y2VwdCBmb3Igcm9vdCBub2RlXHJcblxyXG4gICAgICAgICAgICBRdWV1ZTxOb2RlPiBOb2Rlc1RvUHJvY2VzcyA9IG5ldyBRdWV1ZTxOb2RlPigpO1xyXG4gICAgICAgICAgICBOb2Rlc1RvUHJvY2Vzcy5FbnF1ZXVlKE5vZGVzWzBdKTsgLy8gTWFyayByb290IG5vZGUgYXMgdG8tcHJvY2Vzc1xyXG5cclxuICAgICAgICAgICAgSGFzaFNldDxOb2RlPiBBbHJlYWR5QWRkZWROb2RlcyA9IG5ldyBIYXNoU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgICAgIEFscmVhZHlBZGRlZE5vZGVzLkFkZChOb2Rlc1swXSk7XHJcbiAgICAgICAgICAgIHdoaWxlIChOb2Rlc1RvUHJvY2Vzcy5Db3VudCA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCBhbGwgbm9kZXMgdGhhdCBzdGlsbCBoYXZlIGF2YWlhYmxlIGZsb3cgc3BhY2UgaW4gdGhlbSBhbmQgYXJlbid0IG9jY3VwaWVkIChpbiBGbG93UGF0aClcclxuICAgICAgICAgICAgICAgIE5vZGUgbm9kZSA9IE5vZGVzVG9Qcm9jZXNzLkRlcXVldWUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBOb2RlcyB0aGF0IGFyZSBhY2Nlc3NhYmxlIGZyb20gdGhpcyBub2RlXHJcbiAgICAgICAgICAgICAgICBMaXN0PE5vZGU+IGF2YWlhYmxlTm9kZXMgPSBuZXcgTGlzdDxOb2RlPihub2RlLk91dHB1dEVkZ2VzLkNvdW50ICsgbm9kZS5JbnB1dEVkZ2VzLkNvdW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICBib29sIGRvSW5wdXRFZGdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBib29sIGFyZUlucHV0RWRnZXNGb3JiaWRkZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gcmVuZGVyZWRQYXRoID0gUmVuZGVyUGF0aChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihOb2RlcyksIG5vZGUsIEZsb3dQYXRoKTtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEVkZ2Ugb3V0cHV0RWRnZSBpbiBub2RlLk91dHB1dEVkZ2VzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBmbG93ID0gb3V0cHV0RWRnZS5HZXRDdXJyZW50RmxvdyhyZW5kZXJlZFBhdGgsIHRoaXMsIFwiT3V0cHV0RWRnZXNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsb3cgPiAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVJbnB1dEVkZ2VzRm9yYmlkZGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmxvdyA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWFibGVOb2Rlcy5BZGQob3V0cHV0RWRnZS5Ubyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvSW5wdXRFZGdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkb0lucHV0RWRnZXMgJiYgIWFyZUlucHV0RWRnZXNGb3JiaWRkZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoRWRnZSBpbnB1dEVkZ2UgaW4gbm9kZS5JbnB1dEVkZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUkVTRU5JOiBUb2hsZSBidWR1IHByb2NoYXpldCwgSkVOT00ga2R5eiBuZW5hamR1IHphZG5vdSBjZXN0dSBwb21vY2kgT3V0cHV0RWRnZSAvL1RPRE86IE1vem5lIG5lZnVua2NuaSBwcm8gbmVjbz9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVkdSBobGVkYXQgY2VzdHUgSkVOT00gbWV6aSBocmFuYW1pIGdyYWZ1LCBkbyBrdGVyeWNoIE1VWkUgdGVuIHN0dWRlbnQsIGt0ZXJ5IG1hIGNlc3R1LCBrdGVyb3UgbXUga3JhZHU7IGppdC5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbSBzZSBkb3N0YW51IGplbm9tIHYgcHJpcGFkZSwgemUgdnNlY2hueSBPdXRwdXROb2R5IHogVGltZUNodW5rdShOb2RlKSBqc291IG9kbWl0bnV0eSAtPiBbbm9kZV0gamUgdnpkeSBUaW1lQ2h1bmtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShub2RlLklkZW50aWZpZXIgKyBcIiAoXCIgKyBub2RlLlZhbHVlICsgXCIpXCIsIExvZy5TZXZlcml0eS5Dcml0aWNhbCk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dEVkZ2UgaXMgVGltZUNodW5rKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJJIGZvdW5kIGlucHV0IGVkZ2UgdGhhdCB3YXMgVGltZSBDaHVuazsgZnJvbSA9IFwiICsgaW5wdXRFZGdlLlRvLklkZW50aWZpZXIsIExvZy5TZXZlcml0eS5XYXJuaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2h5P1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVuZGVyZWRQYXRoLkNvdW50ID49IDIgJiYgaW5wdXRFZGdlLkZyb20gPT0gcmVuZGVyZWRQYXRoW3JlbmRlcmVkUGF0aC5Db3VudCAtIDJdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgZmxvdyA9IGlucHV0RWRnZS5HZXRDdXJyZW50RmxvdyhyZW5kZXJlZFBhdGgsIHRoaXMsIFwiSW5wdXRFZGdlc1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsb3cgPT0gMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWFibGVOb2Rlcy5BZGQoaW5wdXRFZGdlLkZyb20pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiSSBqdXN0IHVzZWQgYmFja2Zsb3cuIEhlcmUncyBmdWxsIHBhdGg6IFwiICsgU3RyaW5nLkpvaW4oXCIgLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsc3RyaW5nPihyZW5kZXJlZFBhdGgsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKG4gPT4gc3RyaW5nLkZvcm1hdChcIlxcXCJ7MH1cXFwiKHsxfSlcIixuLklkZW50aWZpZXIsbi5WYWx1ZSkpKSkgKyBcIi4gVGhlIG5ldyBub2RlIGlzIFxcXCJcIiArIGlucHV0RWRnZS5Gcm9tLklkZW50aWZpZXIgKyBcIlxcXCIoXCIgKyBpbnB1dEVkZ2UuRnJvbS5WYWx1ZSArIFwiKVwiLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmlsbCBhbGwgbm9kZXMgdGhhdCBhcmUgYWNjZXNzaWJsZSBmcm9tIHRoaXMgbm9kZVxyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoTm9kZSBub2RlVG9Hb1Rocm91Z2ggaW4gYXZhaWFibGVOb2RlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoQWxyZWFkeUFkZGVkTm9kZXMuQ29udGFpbnMobm9kZVRvR29UaHJvdWdoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIEFscmVhZHlBZGRlZE5vZGVzLkFkZChub2RlVG9Hb1Rocm91Z2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIEZsb3dQYXRoW25vZGVUb0dvVGhyb3VnaF0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVzVG9Qcm9jZXNzLkVucXVldWUobm9kZVRvR29UaHJvdWdoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTm93LCBJIChwcm9iYWJseSkgaGF2ZSBmbG93XHJcbiAgICAgICAgICAgIExvZy5Xcml0ZSh0aGlzLlRvU3RyaW5nKCksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgREVCVUdfV3JpdGVGbG93UGF0aChGbG93UGF0aCk7XHJcbiAgICAgICAgICAgIHZhciBUaW1lQ2h1bmsgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihGbG93UGF0aC5LZXlzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikoeCA9PiB4LklkZW50aWZpZXIgPT0gXCJUaW1lQ2h1bmtcIikpLlNpbmdsZU9yRGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAoVGltZUNodW5rID09IG51bGwgfHwgRmxvd1BhdGhbVGltZUNodW5rXSA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJObyBmbG93XCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIC8vIE5vIGZsb3dcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkFwcGx5aW5nIGZsb3dcIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgQXBwbHlGbG93KFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzKSwgVGltZUNodW5rLCBGbG93UGF0aCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyovLyBGaXJzdCBvZiBhbGwsIHdlIGhhdmUgdG8gY3JlYXRlIHRoZSBkaWN0aW9uYXJ5LCBzbyB3ZSBrbm93LCB3aGF0IHRoZSBwYXRoIGlzXHJcbiAgICAgICAgICAgIERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4gRmxvd1BhdGggPSBuZXcgRGljdGlvbmFyeTxOb2RlLCBOb2RlPigpO1xyXG4gICAgICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgZGljdGlvbmFyeSB3aXRoIG5vZGVzXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbm9kZSBpbiBOb2RlcykgRmxvd1BhdGguQWRkKG5vZGUsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgLy8gSGVyZSwgd2UgY3JlYXRlIFF1ZXVlLCB0aGF0IGhvbGRzIG5vZGVzLCB0aGF0IHdlIHdpbGwgd2FudCB0byB3b3JrIHdpdGhcclxuICAgICAgICAgICAgLy8gUGx1cyBsaXN0IG9mIG5vZGVzIHdoaWNoIHdlcmUgYWxyZWFkeSBhZGRlZCB0byBRdWV1ZSwgc28gd2UgZG9uJ3QgcHJvY2VzcyBvbmUgbm9kZSBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAgICBRdWV1ZTxOb2RlPiBub2Rlc1RvUHJvY2VzcyA9IG5ldyBRdWV1ZTxOb2RlPigpO1xyXG4gICAgICAgICAgICAvLyBBbmQgbGV0J3MgZW5xdWV1ZSByb290IG5vZGVcclxuICAgICAgICAgICAgbm9kZXNUb1Byb2Nlc3MuRW5xdWV1ZShOb2Rlc1swXSk7XHJcbiAgICAgICAgICAgIC8vIEhlcmUncyB0aGUgbGlzdCBvZiBhZGRlZCBub2Rlc1xyXG4gICAgICAgICAgICBIYXNoU2V0PE5vZGU+IGFscmVhZHlBZGRlZE5vZGVzID0gbmV3IEhhc2hTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAgICAgLy8gQW5kIGFkZCB0aGUgcm9vdCBub2RlXHJcbiAgICAgICAgICAgIGFscmVhZHlBZGRlZE5vZGVzLkFkZChOb2Rlc1swXSk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3cgd2UgYnVpbGQgdGhlIGZsb3c6ICovXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgREVCVUdfV3JpdGVGbG93UGF0aChEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+IEZsb3dQYXRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG91dHB1dCA9IFwiS2V5czogXCIgKyBTdHJpbmcuSm9pbihcIiB8IFwiLCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSxzdHJpbmc+KEZsb3dQYXRoLktleXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKHggPT4geC5JZGVudGlmaWVyKSkpO1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG5cIjtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IFwiVmFsdWVzOiBcIiArIFN0cmluZy5Kb2luKFwiIHwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4oRmxvd1BhdGguVmFsdWVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBzdHJpbmc+KSh4ID0+IHggPT0gbnVsbCA/IFwiLS0tXCIgOiB4LklkZW50aWZpZXIpKSk7XHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShvdXRwdXQsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxOb2RlPiBSZW5kZXJQYXRoKE5vZGUgcm9vdE5vZGUsIE5vZGUgZW5kTm9kZSwgRGljdGlvbmFyeTxOb2RlLCBOb2RlPiBmbG93UGF0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8Tm9kZT4gcGF0aCA9IG5ldyBMaXN0PE5vZGU+KCk7XHJcbiAgICAgICAgICAgIHBhdGguQWRkKGVuZE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgTm9kZSBuZXh0Tm9kZSA9IGVuZE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlIChuZXh0Tm9kZSAhPSByb290Tm9kZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV07XHJcbiAgICAgICAgICAgICAgICBwYXRoLkFkZChuZXh0Tm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhdGguUmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxBc3NpZ25tZW50UHJldmlldz4gR2V0UmVzdWx0RnJvbUdyYXBoKGludCBkYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMb2cuV3JpdGUoXCJTdGFydGluZyBHZXRSZXN1bHRGcm9tR3JhcGhcIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRpbWVOb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobm9kZSA9PiBub2RlLlZhbHVlICE9IC0xKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXNlZFRpbWVOb2RlcyA9IHRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5JbnB1dEVkZ2VzLkNvdW50ICE9IDApKTtcclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIlRpbWUgbm9kZXMgdG90YWw6IFwiICsgdXNlZFRpbWVOb2Rlcy5Db3VudCgpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICAvL3ZhciBlZGdlcyA9IHVzZWRUaW1lTm9kZXMuU2VsZWN0KG5vZGUgPT4gbm9kZS5JbnB1dEVkZ2VzLldoZXJlKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsKSA9PSAxKS5TaW5nbGUoKSk7XHJcbiAgICAgICAgICAgIHZhciBlZGdlcyA9IHVzZWRUaW1lTm9kZXMuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsLCBcIkdldFJlc3VsdFwiKSA9PSAxKSkuQ291bnQoKSA9PSAxKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4pKG5vZGUgPT4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwsIFwiR2V0UkVzdWx0MlwiKSA9PSAxKSkuU2luZ2xlKCkpKTtcclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIlRpbWUgbm9kZXMgd2l0aCBzZWxlY3RlZCBlZGdlOiBcIiArIGVkZ2VzLkNvdW50KCksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBlZGdlcy5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRmxvdy5Bc3NpZ25tZW50UHJldmlldz4pKGVkZ2UgPT4gbmV3IEFzc2lnbm1lbnRQcmV2aWV3KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYXNzaWduZWRTdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubmFtZSA9PSBlZGdlLkZyb20uSWRlbnRpZmllci5TcGxpdCgnOicpWzFdKSkuU2luZ2xlKCksXHJcbiAgICAgICAgICAgICAgICBkYXkgPSBkYXksXHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhcnQgPSBlZGdlLlRvLlZhbHVlXHJcbiAgICAgICAgICAgIH0pKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXcsIGludD4pKHJlc3VsdCA9PiByZXN1bHQudGltZVN0YXJ0KSkuVG9MaXN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQXBwbHlTdHVkZW50KEFzc2lnbm1lbnRQcmV2aWV3IHJlc3VsdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5hc3NpZ25lZFN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXN1bHQuYXNzaWduZWRTdHVkZW50LmFzc2lnbmVkRGF5ID0gcmVzdWx0LmRheTtcclxuICAgICAgICAgICAgcmVzdWx0LmFzc2lnbmVkU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSByZXN1bHQudGltZVN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFwcGx5RmxvdyhOb2RlIHJvb3ROb2RlLCBOb2RlIGVuZE5vZGUsIERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4gZmxvd1BhdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOb2RlIG5leHROb2RlID0gZW5kTm9kZTtcclxuICAgICAgICAgICAgd2hpbGUgKG5leHROb2RlICE9IHJvb3ROb2RlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBFZGdlSW5mbyBlZGdlID0gR2V0RWRnZUluZm8obmV4dE5vZGUsIGZsb3dQYXRoW25leHROb2RlXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVkZ2UuSXNGcm9tTm9kZTFUb05vZGUyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVkZ2UuUmVzdWx0RWRnZS5TZXRDdXJyZW50RmxvdygwKTtcclxuICAgICAgICAgICAgICAgICAgICBMb2cuV3JpdGUoc3RyaW5nLkZvcm1hdChcIlNldHRpbmcgZWRnZSBmbG93IGZyb20gezB9IHRvIHsxfSB0byAwXCIsZWRnZS5SZXN1bHRFZGdlLkZyb20uSWRlbnRpZmllcixlZGdlLlJlc3VsdEVkZ2UuVG8uSWRlbnRpZmllciksIExvZy5TZXZlcml0eS5XYXJuaW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlLlJlc3VsdEVkZ2UuU2V0Q3VycmVudEZsb3coMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKHN0cmluZy5Gb3JtYXQoXCJTZXR0aW5nIGVkZ2UgZmxvdyBmcm9tIHswfSB0byB7MX0gdG8gMVwiLGVkZ2UuUmVzdWx0RWRnZS5Gcm9tLklkZW50aWZpZXIsZWRnZS5SZXN1bHRFZGdlLlRvLklkZW50aWZpZXIpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRWRnZUluZm8gR2V0RWRnZUluZm8oTm9kZSBub2RlMSwgTm9kZSBub2RlMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEVkZ2VJbmZvIHJlc3VsdCA9IG5ldyBFZGdlSW5mbygpO1xyXG4gICAgICAgICAgICBFZGdlIGVkZyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUxLk91dHB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLlRvID09IG5vZGUyKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5Jc0Zyb21Ob2RlMVRvTm9kZTIgPSBlZGcgIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChlZGcgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWRnID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZTEuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5Gcm9tID09IG5vZGUyKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0LlJlc3VsdEVkZ2UgPSBlZGc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJ1Y3QgRWRnZUluZm9cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHB1YmxpYyBFZGdlIFJlc3VsdEVkZ2U7XHJcbiAgICAgICAgICAgIHB1YmxpYyBib29sIElzRnJvbU5vZGUxVG9Ob2RlMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RydWN0IEFzc2lnbm1lbnRQcmV2aWV3XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwdWJsaWMgaW50IHRpbWVTdGFydDtcclxuICAgICAgICAgICAgcHVibGljIGludCBkYXk7XHJcbiAgICAgICAgICAgIHB1YmxpYyBVc2VyIGFzc2lnbmVkU3R1ZGVudDtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgY29tbWFuZCA9IFwiZ3JhcGggTFJcXHJcXG5cIjtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbiBpbiBOb2RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoRWRnZSBvdXRwdXRFZGdlIGluIG4uT3V0cHV0RWRnZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCArPSBzdHJpbmcuRm9ybWF0KFwiezB9IC0tPnx7MX18IHsyfVxcclxcblwiLG91dHB1dEVkZ2UuRnJvbS5JZGVudGlmaWVyLG91dHB1dEVkZ2UuR2V0Q3VycmVudEZsb3cobmV3IE5vZGVbMF0sIHRoaXMsIFwiVGhpc1RvU3RyaW5nXCIpLG91dHB1dEVkZ2UuVG8uSWRlbnRpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29tbWFuZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3dcclxue1xyXG4gICAgcHVibGljIGNsYXNzIE5vZGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgZW51bSBOb2RlVHlwZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRGVmYXVsdCxcclxuICAgICAgICAgICAgSW5wdXQsXHJcbiAgICAgICAgICAgIE91dHB1dFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBJZGVudGlmaWVyO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgVmFsdWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBMaXN0PEVkZ2U+IElucHV0RWRnZXM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8RWRnZT4gT3V0cHV0RWRnZXM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBOb2RlVHlwZSBUeXBlO1xyXG5cclxuICAgICAgICBwdWJsaWMgTm9kZShzdHJpbmcgaWRlbnRpZmllciwgaW50IHZhbHVlLCBOb2RlVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSWRlbnRpZmllciA9IGlkZW50aWZpZXI7XHJcbiAgICAgICAgICAgIFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuSW5wdXRFZGdlcyA9IG5ldyBMaXN0PEVkZ2U+KCk7XHJcbiAgICAgICAgICAgIHRoaXMuT3V0cHV0RWRnZXMgPSBuZXcgTGlzdDxFZGdlPigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVXNlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgcHVibGljIGJvb2wgYXNzaWduZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0SG91cnNJbkRheShpbnQgZGF5SW5kZXgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF5SW5kZXggPCAwIHx8IGRheUluZGV4ID49IDUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oXCJQYXJhbWV0ZXIgTVVTVCBCRSBpbiByYW5nZSBbMDsgNSkuIFZhbHVlOiBcIiArIGRheUluZGV4LCBcImRheUluZGV4XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2RheUluZGV4XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiO1xyXG5cclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNGID0gbWludXRlc0Zyb21BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG4gICAgICAgICAgICBpbnQgbWludXRlc1QgPSBtaW51dGVzVG9BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgaW50IGhvdXJzRiA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzRiAvIDYwZCk7XHJcbiAgICAgICAgICAgIGludCBob3Vyc1QgPSAoaW50KU1hdGguRmxvb3IobWludXRlc1QgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJPZCB7MH06ezF9IGRvIHsyfTp7M31cIixob3Vyc0YsKG1pbnV0ZXNGIC0gaG91cnNGICogNjApLlRvU3RyaW5nKFwiMDBcIiksaG91cnNULChtaW51dGVzVCAtIGhvdXJzVCAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlclxyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIExvZ1xyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGludCBsZW5ndGhDb2xsYXBzZVN0YXJ0ID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGludCBwcmV2aWV3TGVuZ3RoID0gMzA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBlbnVtIFNldmVyaXR5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBJbmZvLFxyXG4gICAgICAgICAgICBXYXJuaW5nLFxyXG4gICAgICAgICAgICBDcml0aWNhbFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTERpdkVsZW1lbnQgdGFyZ2V0O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgSW5pdGlhbGl6ZVdpdGhEaXYoSFRNTERpdkVsZW1lbnQgdGFyZ2V0RGl2KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0RGl2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBXcml0ZShvYmplY3QgbywgU2V2ZXJpdHkgc2V2ZXJpdHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBMb2cgb2JqZWN0IHRvIGphdmFzY3JpcHQgY29uc29sZVxyXG4gICAgICAgICAgICBCcmlkZ2UuU2NyaXB0LkNhbGwoXCJjb25zb2xlLmxvZ1wiLCBvKTtcclxuICAgICAgICAgICAgLy8gTG9nIG9iamVjdCB3aXRoIHNldmVyaXR5IHRvIHRoZSBkaXZcclxuICAgICAgICAgICAgc3RyaW5nIHRleHQgPSBvLlRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBzdHJpbmcgaHRtbCA9IFN0cmluZy5FbXB0eTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHRleHQgaXMgdmVyeSBsb25nLCBjb2xsYXBzZSBpdFxyXG4gICAgICAgICAgICBpZih0ZXh0Lkxlbmd0aCA+IGxlbmd0aENvbGxhcHNlU3RhcnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc3RyaW5nIHByZXZpZXcgPSB0ZXh0LlN1YnN0cmluZygwLCBwcmV2aWV3TGVuZ3RoKSArIFwiLi4uXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sID0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2xvZ0V4cGFuZGFibGUnIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS10YXJnZXQ9JyNjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPlwiICsgXCI8cCBzdHlsZT0nY29sb3I6IFwiICsgR2V0Q29sb3JCYXNlZE9uU2V2ZXJpdHkoc2V2ZXJpdHkpICsgXCI7Jz5cIiArIHByZXZpZXcgKyBcIjwvcD48L2Rpdj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPSdjb2xsYXBzZSByb3cnIGlkPSdjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPjxkaXYgY2xhc3M9J2NhcmQgY2FyZC1ib2R5Jz5cIiArIHRleHQgKyBcIjwvZGl2PjwvZGl2PlwiO1xyXG4gICAgICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IFwiPHAgc3R5bGU9J2NvbG9yOiBcIiArIEdldENvbG9yQmFzZWRPblNldmVyaXR5KHNldmVyaXR5KSArIFwiOyc+XCIgKyB0ZXh0ICsgXCI8cD5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgV3JpdGVUb0RlYnVnKGh0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBXcml0ZVRvRGVidWcoc3RyaW5nIGh0bWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQuSW5uZXJIVE1MICs9IGh0bWwgKyBcIjxociAvPlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIEdldENvbG9yQmFzZWRPblNldmVyaXR5KFNldmVyaXR5IHNldmVyaXR5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoIChzZXZlcml0eSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTZXZlcml0eS5JbmZvOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNldmVyaXR5Lldhcm5pbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiR3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgU2V2ZXJpdHkuQ3JpdGljYWw6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiUmVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUaW1lQ2h1bmsgOiBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFRpbWVDaHVuayhOb2RlIGZyb20sIE5vZGUgdG8pIDogYmFzZSgwLCAwLCBmcm9tLCB0bykgeyB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW50IEdldEJsb2NraW5nTm9kZXMoSUVudW1lcmFibGU8Tm9kZT4gdGltZU5vZGVzLCBOb2RlIGJhc2VOb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGJsb2NraW5nTm9kZXMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KSh0Tm9kZSA9PiBNYXRoLkFicyh0Tm9kZS5WYWx1ZSAtIGJhc2VOb2RlLlZhbHVlKSA8IDUwKSkuQ291bnQoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKGJsb2NraW5nTm9kZXMgPT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiSSBqdXN0IHBhc3NlZCB3aXRoIHRoaXMgc2V0dGluZ3M6IFwiICsgU3RyaW5nLkpvaW4oXCIgLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsc3RyaW5nPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKG5vZGUgPT4gbm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIG5vZGUuVmFsdWUpKSkgKyBcIi4gQmFzZSB3YXMgXCIgKyBiYXNlTm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIGJhc2VOb2RlLlZhbHVlLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiSSBkaWRuJ3QgcGFzcyB3aXRoIHRoaXMgc2V0dGluZ3M6XCIgKyBTdHJpbmcuSm9pbihcIiAsIFwiLCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSxzdHJpbmc+KHRpbWVOb2RlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgc3RyaW5nPikobm9kZSA9PiBub2RlLklkZW50aWZpZXIgKyBcIiB3aXRoIHZhbHVlIFwiICsgbm9kZS5WYWx1ZSkpKSArIFwiLiBCYXNlIHdhcyBcIiArIGJhc2VOb2RlLklkZW50aWZpZXIgKyBcIiB3aXRoIHZhbHVlIFwiICsgYmFzZU5vZGUuVmFsdWUsIExvZy5TZXZlcml0eS5Dcml0aWNhbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBibG9ja2luZ05vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgICAgIC8vLyBcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImN1cnJlbnRQYXRoXCI+PC9wYXJhbT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJmbG93XCI+PC9wYXJhbT5cclxuICAgICAgICAvLy8gPHJldHVybnM+TnVtYmVyIG9mIG5vZGVzIHRoYXQgYmxvY2sgY3VycmVudCBwYXRoPC9yZXR1cm5zPlxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgR2V0Q3VycmVudEZsb3coSUVudW1lcmFibGU8Tm9kZT4gY3VycmVudFBhdGgsIEZsb3cgZmxvdywgc3RyaW5nIGluZm8pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoaW5mbyA9PSBcIlRoaXNUb1N0cmluZ1wiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludC5NaW5WYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGludCBibG9ja2luZ05vZGVzID0gLTE7XHJcbiAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBOb2RlIGJhc2VOb2RlID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0xpc3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KGN1cnJlbnRQYXRoKVtTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aCkgLSAyXTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkdldEN1cnJlbnRGbG93IFBhdGg6IFwiICsgU3RyaW5nLkpvaW48aW50PihcIixcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsaW50PihjdXJyZW50UGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgaW50Pikobm9kZSA9PiBub2RlLlZhbHVlKSkpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgYWxsVGltZU5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oZmxvdy5Ob2RlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSAhPSAtMSAmJiBub2RlICE9IGJhc2VOb2RlICYmIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsLCBcIkdldEN1cnJlbnRGbG93XCIpID09IDEpKS5Db3VudCgpID09IDEpKS5Ub0xpc3QoKTtcclxuICAgICAgICAgICAgICAgIGFsbFRpbWVOb2Rlcy5BZGRSYW5nZShTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSAhPSAtMSAmJiBub2RlICE9IGJhc2VOb2RlKSkpO1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiU3RhcnRpbmcgQmxvY2tpbmdOb2Rlcy4uLlwiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICBibG9ja2luZ05vZGVzID0gR2V0QmxvY2tpbmdOb2RlcyhhbGxUaW1lTm9kZXMsIGJhc2VOb2RlKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkVuZGluZyBCbG9ja2luZ05vZGVzLi4uXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgfWNhdGNoKEV4Y2VwdGlvbiBleClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiQmxvY2tpbmdOb2RlcyBGYWlsZWQhIEluZm86IFwiICsgaW5mbywgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShleCwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBibG9ja2luZ05vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgU2V0Q3VycmVudEZsb3coaW50IG5ld1ZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gRG8gbm90aGluZ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==

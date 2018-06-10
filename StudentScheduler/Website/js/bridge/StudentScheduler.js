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
                StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User("Test Teacher", System.Array.init([true, false, true, false, false], System.Boolean), System.Array.init([720, 0, 840, 0, 0], System.Int32), System.Array.init([1200, 0, 1140, 0, 0], System.Int32)));

                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 1", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([900, 0, 0, 0, 0], System.Int32), System.Array.init([960, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 2", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([660, 0, 0, 0, 0], System.Int32), System.Array.init([1080, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 3", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([720, 0, 0, 0, 0], System.Int32), System.Array.init([840, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 4", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([0, 0, 0, 0, 0], System.Int32), System.Array.init([1439, 0, 0, 0, 0], System.Int32)));


                /* plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));

                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 10 * 60 + 10, 0, 0, 0, 0 }, new int[] { 11 * 60 + 50, 0, 0, 0, 0 }));
                */
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
            DEBUG_ClearNodes: function () {
                this.Nodes.clear();
            },
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
                var $t;
                // First of all, let's create a dictionary, when we'll store currently chosen path
                var NodesPath = new (System.Collections.Generic.Dictionary$2(StudentScheduler.AppLogic.NetworkFlow.Node,StudentScheduler.AppLogic.NetworkFlow.NodesPathCollection))();
                // Add keys and null
                this.Nodes.forEach(function (node) {
                    NodesPath.add(node, new StudentScheduler.AppLogic.NetworkFlow.NodesPathCollection());
                });

                // Let's start processing nodes
                var nodesToProcess = new (System.Collections.Generic.Queue$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                nodesToProcess.enqueue(this.Nodes.getItem(0));
                NodesPath.get(this.Nodes.getItem(0)).Nodes.add(new StudentScheduler.AppLogic.NetworkFlow.Node("Input Placeholder", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Input));

                // While there's something to process, process it
                while (nodesToProcess.Count > 0) {
                    // Start by getting node from the queue
                    var node = nodesToProcess.dequeue();

                    // And get current path
                    var path = { v : this.RenderPath(this.Nodes.getItem(0), node, NodesPath) };
                    // Now we need to get next nodes from this node...
                    var nextNodes = System.Linq.Enumerable.from(node.OutputEdges).where((function ($me, path) {
                            return Bridge.fn.bind($me, function (edge) {
                                return edge.GetCurrentFlow(path.v, this, "Getting output nodes") === 0;
                            });
                        })(this, path));
                    // And get previous nodes
                    var previousNodes = System.Linq.Enumerable.from(node.InputEdges).where((function ($me, path) {
                            return Bridge.fn.bind($me, function (edge) {
                                return edge.GetCurrentFlow(path.v, this, "Getting input nodes") === 1;
                            });
                        })(this, path));
                    // Filter the nodes to only allow those that are not in alreadyProcessedNodes
                    nextNodes = nextNodes.where(function (newNode) {
                        return NodesPath.get(newNode.To).Nodes.Count === 0 || (Bridge.referenceEquals(newNode.To.Identifier, "TimeChunk") && NodesPath.get(newNode.To).SelectedNode == null);
                    });
                    previousNodes = previousNodes.where(function (newNode) {
                        return NodesPath.get(newNode.From) == null;
                    });
                    // Add all these nodes to queue
                    $t = Bridge.getEnumerator(nextNodes.select(function (edge) {
                        return edge.To;
                    }).union(previousNodes.select(function (edge) {
                        return edge.From;
                    })));
                    try {
                        while ($t.moveNext()) {
                            var newNode = $t.Current;
                            nodesToProcess.enqueue(newNode);
                            NodesPath.get(newNode).Nodes.add(node);

                            if (Bridge.referenceEquals(newNode.Identifier, "TimeChunk")) {
                                // Check if the path may go through time chunk
                                var canPass = newNode.OutputEdges.getItem(0).GetCurrentFlow(path.v, this, "Adding SelectedNode") === 0;

                                if (canPass) {
                                    NodesPath.get(newNode).SelectedNode = node;
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                // Now, I (probably) have flow
                var output = System.Linq.Enumerable.from(NodesPath.getKeys()).where(function (x) {
                        return Bridge.referenceEquals(x.Identifier, "Output");
                    }).singleOrDefault(null, null);
                if (output == null || NodesPath.get(output).Nodes.Count === 0) {
                    // No flow
                    StudentScheduler.Log.Write("Failure:", StudentScheduler.Log.Severity.Info);
                    return false;
                } else {
                    StudentScheduler.Log.Write("Success", StudentScheduler.Log.Severity.Info);
                    this.ApplyFlow(this.RenderPath(this.Nodes.getItem(0), output, NodesPath));
                    StudentScheduler.Log.Write(this, StudentScheduler.Log.Severity.Info);
                    return true;
                }
            },
            ApplyFlow: function (path) {
                for (var i = 0; i < ((System.Linq.Enumerable.from(path).count() - 1) | 0); i = (i + 1) | 0) {
                    // Select node:nextNode
                    var prevNode = path.getItem(i);
                    var nextNode = { v : path.getItem(((i + 1) | 0)) };

                    // Now set the edge between them to the opposite value
                    var edgeBetweenNodes = System.Linq.Enumerable.from(prevNode.OutputEdges).union(prevNode.InputEdges).where((function ($me, nextNode) {
                        return function (edge) {
                            return Bridge.referenceEquals(edge.From, nextNode.v) || Bridge.referenceEquals(edge.To, nextNode.v);
                        };
                    })(this, nextNode)).single();
                    if (!(Bridge.is(edgeBetweenNodes, StudentScheduler.AppLogic.NetworkFlow.TimeChunk))) {
                        edgeBetweenNodes.SetCurrentFlow(edgeBetweenNodes.GetCurrentFlow(null, null, "Flow Apply") === 0 ? 1 : 0);
                    }
                }
            },
            RenderPath: function (rootNode, endNode, flowPath) {
                var path = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                path.add(endNode);

                var nextNode = endNode;
                while (!Bridge.referenceEquals(nextNode, rootNode)) {
                    if (nextNode == null) {
                        break;
                    }

                    // As nextNode, select either SelectedNode, or, if it is null, first element of Nodes list
                    nextNode = flowPath.get(nextNode).SelectedNode || flowPath.get(nextNode).Nodes.getItem(0);
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

    /** @namespace StudentScheduler.AppLogic.NetworkFlow */

    /**
     * This is used as value in NodesPath
     *
     * @class StudentScheduler.AppLogic.NetworkFlow.NodesPathCollection
     */
    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.NodesPathCollection", {
        fields: {
            Nodes: null,
            SelectedNode: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this.Nodes = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                this.SelectedNode = null;
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
                // Alter flow

                /* flow.DEBUG_ClearNodes();
                Node root = new Node("Input", -1, Node.NodeType.Input);
                Node sink = new Node("Output", -1, Node.NodeType.Output);
                // Create students 1 and 2
                Node s1 = new Node("Student 1", -1, Node.NodeType.Default);
                Node s2 = new Node("Student 2", -1, Node.NodeType.Default);
                // Create times (not overlapping)
                Node t1 = new Node("Time (100)", 100, Node.NodeType.Default);
                Node t2 = new Node("Time (700)", 700, Node.NodeType.Default);
                // Add time chunk
                Node tch = new Node("Time Chunk Node", -1, Node.NodeType.Default);
                // Add paths from root to students and from times to timechunk and from timechunk via [timechunk] to sink
                root.OutputEdges.Add(new Edge(1, 0, root, s1));
                root.OutputEdges.Add(new Edge(1, 0, root, s2));
                s1.InputEdges.Add(root.OutputEdges[0]);
                s2.InputEdges.Add(root.OutputEdges[1]);

                t1.OutputEdges.Add(new Edge(1, 0, t1, tch));
                t2.OutputEdges.Add(new Edge(1, 0, t2, tch));
                tch.InputEdges.Add(t1.OutputEdges[0]);
                tch.InputEdges.Add(t1.OutputEdges[0]);

                tch.OutputEdges.Add(new TimeChunk(tch, sink));
                sink.InputEdges.Add(tch.OutputEdges[0]);
                // Add paths from students to times
                s1.OutputEdges.Add(new Edge(1, 0, s1, t1));
                s1.OutputEdges.Add(new Edge(1, 0, s1, t2));

                // Apply new graph
                flow.Nodes.AddRange(new List<Node>() { root, s1, s2, t1, t2, tch, sink });*/
                // End of alter flow
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
                    // Time node, that I want to go through
                    var baseNode = System.Linq.Enumerable.from(currentPath).toList(Bridge.global.StudentScheduler.AppLogic.NetworkFlow.Node).getItem(((System.Linq.Enumerable.from(currentPath).count() - 1) | 0));
                    StudentScheduler.Log.Write("GetCurrentFlow Path: " + (Bridge.toArray(System.Linq.Enumerable.from(currentPath).select(function (node) {
                                return node.Value;
                            })).join(",") || ""), StudentScheduler.Log.Severity.Info);
                    var allTimeNodes = System.Linq.Enumerable.from(flow.Nodes).where(function (node) {
                            return node.Value !== -1 && !Bridge.referenceEquals(node, baseNode) && System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                                    return edge.GetCurrentFlow(null, null, "GetCurrentFlow") === 1;
                                }).count() === 1;
                        }).toList(StudentScheduler.AppLogic.NetworkFlow.Node);
                    System.Linq.Enumerable.from(allTimeNodes).union(System.Linq.Enumerable.from(currentPath).where(function (node) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvTmV0d29ya0Zsb3cvRWRnZS5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L0Zsb3cuY3MiLCJBcHBMb2dpYy9OZXR3b3JrRmxvdy9Ob2RlLmNzIiwiQXBwTG9naWMvVXNlci5jcyIsIkxvZy5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L1RpbWVDaHVuay5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLCtCQUFMQSxLQUFLQSxZQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLGdDQUFMQSxLQUFLQSxhQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSxLQUFLQSxnQ0FBTEEsS0FBS0EsYUFBY0E7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLEtBQUtBOzs7O1lBRTNEQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7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RkE7dUNBQVFBLDJDQUFtQ0E7c0VBQWdDQSw4Q0FBdUNBLGdCQUFnQkE7OztnQkFHOVhBLE9BQU9BOzs7Ozs7Ozs7Ozs7O3NDQVN3QkEsYUFBK0JBLE1BQVdBO2dCQUV6RUEsSUFBSUE7b0JBQ0FBLE9BQU9BOzs7Z0JBRVhBLG9CQUFvQkE7Z0JBQ3BCQTs7b0JBR0lBLGVBQWdCQSw0QkFBa0ZBLG9CQUFwREEsa0VBQWlFQSw4QkFBaUZBO29CQUNoTUEsMkJBQVVBLDJCQUEwQkEsZUFBc0JBLDRCQUFzRkEsb0JBQVlBLEFBQStFQTt1Q0FBUUE7a0RBQWVBO29CQUNsUUEsbUJBQW1CQSw0QkFBaUZBLGtCQUFXQSxBQUFnRkE7bUNBQVFBLGVBQWNBLE1BQU1BLDhCQUFRQSxhQUFZQSw0QkFBaUZBLHVCQUFnQkEsQUFBZ0ZBOzJDQUFRQSxvQkFBb0JBLE1BQU1BOzs7b0JBQ2xkQSw0QkFBaUdBLG9CQUFhQSw0QkFBaUZBLG1CQUFZQSxBQUFnRkE7dUNBQVFBLGVBQWNBLE1BQU1BLDhCQUFRQTs7b0JBQy9TQSx3REFBdUNBO29CQUN2Q0EsZ0JBQWdCQSxzQkFBaUJBLGNBQWNBO29CQUMvQ0Esc0RBQXFDQTs7OztvQkFJckNBLDJCQUFVQSxrQ0FBaUNBLGFBQU1BO29CQUNqREEsMkJBQVVBLElBQUlBO29CQUNkQSxNQUFNQTs7Z0JBRVZBLE9BQU9BOztzQ0FHeUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBOZXd0b25zb2Z0Lkpzb247XHJcbnVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWM7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZWxlY3RlZERheTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgZGF5SWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZ1tdIGRheXMgPSB7IFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJidXQtdGltZS1zZXRcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGMgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IFNvbWVEYXlFZGl0SG91cnNDbGljayhidXRzW2NdKTsgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vyc1wiKS5PbkNsaWNrID0gKGUpID0+IHsgU2F2ZUhvdXJDaGFuZ2UoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnMtY2FuY2VsXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBSZW1vdmVIb3VySW5EYXkoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwicnVuXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBwbGFuLkNhbGMoKTsgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7IH07XHJcblxyXG4gICAgICAgICAgICAvLyBUZXN0XHJcbiAgICAgICAgICAgIEdpZChcInRlc3RcIikuT25DbGljayA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihcIlRlc3QgVGVhY2hlclwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIHRydWUsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAxNCAqIDYwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDIwICogNjAsIDAsIDE5ICogNjAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAxXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxNSAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE2ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDJcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDExICogNjAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsxOCAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAzXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE0ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDRcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMjMgKiA2MCArIDU5LCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAvKnBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKFwiVGVzdCBUZWFjaGVyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDFcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDEwICogNjAgKyAxMCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxMSAqIDYwICsgNTAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHBsYW4uQ2FsYygpO1xyXG4gICAgICAgICAgICAgICAgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBMb2cuSW5pdGlhbGl6ZVdpdGhEaXYoR2lkKFwibG9nRGl2XCIpIGFzIEhUTUxEaXZFbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3VGVhY2hlcihIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwidGVhY2hlci1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1RlYWNoZXJOYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdUZWFjaGVyTmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi50ZWFjaGVycy5BZGQobmV3IFVzZXIobmV3VGVhY2hlck5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInRlYWNoZXJzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3VGVhY2hlck5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCB0cnVlKTsgfTtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIC8vIEFsbG93IG9ubHkgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgR2lkKFwiYWRkLW5ldy10ZWFjaGVyLW1vZGFsLWJ1dHRvblwiKS5SZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3U3R1ZGVudChIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwic3R1ZGVudC1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1N0dWRlbnROYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdTdHVkZW50TmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIobmV3U3R1ZGVudE5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInN0dWRlbnRzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3U3R1ZGVudE5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnN0dWRlbnRzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCBmYWxzZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIsIGJvb2wgd2FzVGVhY2hlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhc3RTZXRXYXNUZWFjaGVyID0gd2FzVGVhY2hlcjtcclxuICAgICAgICAgICAgbGFzdFNldElkID0gaW50LlBhcnNlKChzZW5kZXIgYXMgSFRNTEVsZW1lbnQpLkdldEF0dHJpYnV0ZShcIm5hbWVcIikpO1xyXG4gICAgICAgICAgICBMaXN0PFVzZXI+IHNlbGVjdGVkQ29sbGVjdGlvbiA9ICh3YXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHMpO1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtbW9uZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMCk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXR1ZXNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgxKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtd2VkbmVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMik7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXRodXJzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMyk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLWZyaWRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDQpO1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0VGltZU1vZGFsSW5mb1RleHRcIikuSW5uZXJIVE1MID0gXCJWIHRlbnRvIGRlbiBtw6EgXCIgKyBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5uYW1lICsgXCIgxI1hc1wiO1xyXG5cclxuICAgICAgICAgICAgVXBkYXRlTGlzdE9mRGF5cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBTb21lRGF5RWRpdEhvdXJzQ2xpY2sob2JqZWN0IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRheUlkID0gaW50LlBhcnNlKChzZW5kZXIgYXMgSFRNTEVsZW1lbnQpLkdldEF0dHJpYnV0ZShcIm5hbWVcIikpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGdldFRpbWVGcm9tSEggPSBHaWQoXCJnZXQtdGltZS1mcm9tLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbU1NID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZVRvSEggPSBHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZVRvTU0gPSBHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVzciA9IGNvbGxlY3Rpb25bbGFzdFNldElkXTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodXNyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCBob3Vyc0Zyb20gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gaG91cnNGcm9tLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbU1NLlZhbHVlID0gKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLSBob3Vyc0Zyb20gKiA2MCkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tSEguVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZiAodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNUbyA9IChpbnQpTWF0aC5GbG9vcih1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IGhvdXJzVG8uVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb01NLlZhbHVlID0gKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNUbyAqIDYwZCkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb0hILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVUb01NLlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBTYXZlSG91ckNoYW5nZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBmcm9tID0gKGludCkoaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS1mcm9tLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlKSAqIDYwICsgaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS1mcm9tLW1tXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICBpbnQgdG8gPSAoaW50KShpbnQuUGFyc2UoKEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlKSAqIDYwICsgaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmcm9tICsgUGxhbi5sZXNzb25MZW5ndGggPiB0bylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBSZW1vdmVIb3VySW5EYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IGZyb207XHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IHRvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIHsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZW1vdmVIb3VySW5EYXkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgVXBkYXRlTGlzdE9mRGF5cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdG8gYWxsIGRheXM6IGlmIHRoZXJlIGlzIGF0IGxlYXN0IHtQbGFuLmxlc3Nvbkxlbmd0aH0gKDUwKSBtaW51dGVzIGJldHdlZW4gdHdvIHRpbWVzOiByZXR1cm4gdGltZXMgaW4gZm9ybWF0IFtcIkhIOk1NIC0gSEg6TU1cIl0sIGVsc2UsIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiXHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgNTsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1cIiArIGRheXNbaV0pLklubmVySFRNTCA9IGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbaV0gLSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0gPCBQbGFuLmxlc3Nvbkxlbmd0aCA/IFwiTmVuw60gbmFzdGF2ZW5vXCIgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc0Zyb21BdmFpbGFibGVbaV0pICsgXCIgLSBcIiArIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmcgTWludXRlc1RvSG91cnNBbmRNaW51dGVzKGludCBtaW51dGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGhvdXJzID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXMgLyA2MGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gaG91cnMuVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKG1pbnV0ZXMgLSBob3VycyAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE15TnVtYmVyVG9TdHJpbmdXaXRoQXRMZWFzdFR3b0RpZ2l0c0Zvcm1hdChpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG51bSA9IG51bWJlci5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAobnVtLkxlbmd0aCA9PSAxKVxyXG4gICAgICAgICAgICAgICAgbnVtID0gXCIwXCIgKyBudW07XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudCBHaWQoc3RyaW5nIGlkKSB7cmV0dXJuIERvY3VtZW50LkdldEVsZW1lbnRCeUlkKGlkKTt9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTENvbGxlY3Rpb24gR2NsKHN0cmluZyBjbHMpIHtyZXR1cm4gRG9jdW1lbnQuQm9keS5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscyk7fVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdztcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBsYW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGxlc3Nvbkxlbmd0aCA9IDUwOyAvLyA0NSArIDUgcGF1c2VcclxuICAgICAgICBwcml2YXRlIGNvbnN0IGludCBicmVha0FmdGVyTGVzc29ucyA9IDM7IC8vIEJyZWFrIGFmdGVyIDMgbGVzc29uc1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggPSAxNTtcclxuICAgICAgICBwcml2YXRlIGludFtdIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnQgPSBuZXcgaW50W10geyBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSwgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdlbmVyYXRlSFRNTCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcyA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICB2YXIgbm90UG9zU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQpKTtcclxuICAgICAgICAgICAgdmFyIHBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3RQb3NTdHVkZW50cy5Db3VudCgpID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtZGFuZ2VyIGFsZXJ0LWRpc21pc3NpYmxlIGZhZGUgc2hvd1xcXCJyb2xlPVxcXCJhbGVydFxcXCJcIikrXHJcbnN0cmluZy5Gb3JtYXQoXCI8cD5OZXBvZGHFmWlsbyBzZSBuYWrDrXQgbcOtc3RvIHBybyB7MH0geiB7MX0gxb7DoWvFryBcIixub3RQb3NTdHVkZW50cy5Db3VudCgpLHN0dWRlbnRzLkNvdW50KStcclxuc3RyaW5nLkZvcm1hdChcIih7MH0pPC9wPlwiLFN0cmluZy5Kb2luKFwiLCBcIiwgbm90UG9zU3R1ZGVudHMuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkuVG9BcnJheSgpKSkrXHJcbnN0cmluZy5Gb3JtYXQoXCI8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImNsb3NlXFxcIiBkYXRhLWRpc21pc3M9XFxcImFsZXJ0XFxcIiBhcmlhLWxhYmVsPVxcXCJDbG9zZVxcXCI+XCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPsOXPC9zcGFuPjwvYnV0dG9uPjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RyaW5nW10gZGF5cyA9IHsgXCJQb25kxJtsw61cIiwgXCLDmnRlcsO9XCIsIFwiU3TFmWVkYVwiLCBcIsSMdHZydGVrXCIsIFwiUMOhdGVrXCIgfTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgcG9zc2VkU3R1ZGVudHNUb2RheSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwicm93XFxcIj48ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCI+PGgzPnswfTwvaDM+XCIsZGF5c1tkYXldKTtcclxuICAgICAgICAgICAgICAgIC8vIDxkaXYgY2xhc3M9XCJjYXJkIGNhcmQtYm9keVwiPlBldHIgKDEwOjAwIC0gMTA6NTApPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBzc2RheSA9IHBvc1N0dWRlbnRzLldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkRGF5ID09IGRheSkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4LmFzc2lnbmVkTWludXRlcykpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHNzZGF5Lkxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCI8aT5OYSB0ZW50byBkZW4gbmVuw60gbmljIG5hcGzDoW5vdmFuw6lobzwvaT5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHBzc2RheS5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGN1cnJlbnQgPSBwc3NkYXlbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzZWRTdHVkZW50c1RvZGF5ID09IGJyZWFrQWZ0ZXJMZXNzb25zICYmIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAhPSBpbnQuTWF4VmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgYnJlYWtGcm9tID0gKGludClNYXRoLkZsb29yKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBicmVha1RvID0gKGludClNYXRoLkZsb29yKChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aCkgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nIEJyZWFrSEZyb20gPSBicmVha0Zyb20uVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAtIGJyZWFrRnJvbSAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgQnJlYWtIVG8gPSBicmVha1RvLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aCAtIGJyZWFrVG8gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIiBzdHlsZT1cXFwiZGlzcGxheTogaW5saW5lO1xcXCI+PHNwYW4gc3R5bGU9XFxcImZvbnQtc3R5bGU6IGl0YWxpYztcXFwiPlDFmWVzdMOhdmthPC9zcGFuPiAoezB9IC0gezF9KTwvZGl2PlwiLEJyZWFrSEZyb20sQnJlYWtIVG8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNUbyA9IChpbnQpTWF0aC5GbG9vcigoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGgpIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nIGhGcm9tID0gaG91cnNGcm9tLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyAtIGhvdXJzRnJvbSAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoVG8gPSBob3Vyc1RvLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aCAtIGhvdXJzVG8gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPnswfSAoXCIsY3VycmVudC5uYW1lKStcclxuc3RyaW5nLkZvcm1hdChcInswfSAtIHsxfSk8L2Rpdj5cIixoRnJvbSxoVG8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwb3NzZWRTdHVkZW50c1RvZGF5Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcyArPSBcIjwvZGl2PjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IEkgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIHRlYWNoZXJcclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChVc2VyIHRlYWNoZXIgaW4gdGVhY2hlcnMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gbGVzc29uTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciBzdHVkZW50IGluIHN0dWRlbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHVkZW50Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gc3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5kYXlzQXZhaWxhYmxlW2RheV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIEhPVyBUSElTIFdPUktTOlxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIDEuMCkgU2V0IHN0YXJ0IHRpbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUgb2YgdGhlIGRheVxyXG4gICAgICAgICAgICAvLyAxLjEpIEZpbmQgc3R1ZGVudCB3aG8gaGFzIHN0YXJ0aW5nIHRpbWUgdGhlIHNhbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUuIElmIHllcywgcG9zIGFuZCByZXBlYXQgMSkgNDUgbWludXRlcyBsYXRlci5cclxuICAgICAgICAgICAgLy8gICAgICBJZiBub3QsIG1vdmUgYnkgNSBtaW51dGVzIGFuZCB0cnkgaXQgYWdhaW4gd2l0aCBhbGwgc3R1ZGVudHMuIElmIGhpdCB0ZWFjaGVyJ3MgZW5kIHRpbWUsIG1vdmUgdG8gbmV4dCBkYXlcclxuXHJcbiAgICAgICAgICAgIC8vIE9QVElNQUxJWkFUSU9OOiBDaGVjayBpZiBib3RoIHRlYWNoZXIgYW5kIHN0dWRlbnRzIGhhdmUgc29tZSBtaW51dGVzIGluIGNvbW1vbi4gSWYgbm90LCBza2lwIHRoaXMgZGF5XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhbGwgc3R1ZGVudHMgYXJlIHBvc2l0aW9uZWQsIGVuZC4gSWYgbm90LCBoZWFkIHRvIHN0ZXAgMlxyXG5cclxuICAgICAgICAgICAgLy8gMi4wKSBJIGhhdmUgc29tZSBzdHVkZW50cyB3aXRob3V0IGFzc2lnbmVkIGhvdXJzLiBQaWNrIHN0dWRlbnQgd2l0aCBsZWFzdCBwb3NzaWJsZSBob3Vycy4gRmluZCBhbGxcclxuICAgICAgICAgICAgLy8gICAgICBob3VycyB3aGVyZSBJIGNhbiBwb3MgdGhpcyBzdHVkZW50IGluIGFsbCBkYXlzLlxyXG4gICAgICAgICAgICAvLyAyLjEpIENob29zZSB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGxlYXN0IHVuYXNzaWduZWQgc3R1ZGVudHMgY2FuIGdvLiBBZnRlciB0aGF0LCBjaG9vc2UgcG9zaXRpb24gd2hlcmVcclxuICAgICAgICAgICAgLy8gICAgICBpcyBzdHVkZW50IHdpdGggbW9zdCBmcmVlIHRpbWVcclxuICAgICAgICAgICAgLy8gMi4yKSBTd2FwIHRob3NlIHN0dWRlbnRzXHJcbiAgICAgICAgICAgIC8vIDIuMykgUmVwZWF0LiBJZiBhbHJlYWR5IHJlcGVhdGVkIE4gdGltZXMsIHdoZXJlIE4gaXMgbnVtYmVyIG9mIHVuYXNzaWduZWQgc3R1ZGVudHMgYXQgdGhlIGJlZ2dpbmluZyBvZiBwaGFzZSAyLFxyXG4gICAgICAgICAgICAvLyAgICAgIGVuZCwgc2hvdyBhbGwgcG9zaXRpb25lZCBzdHVkZW50cyBhbmQgcmVwb3J0IGZhaWx1cmVcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHRlYWNoZXJzLkNvdW50ICE9IDEgfHwgc3R1ZGVudHMuQ291bnQgPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpb3VzIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0dWRlbnRzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZERheSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWRNaW51dGVzID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEZpcnN0IHN0YWdlXHJcbiAgICAgICAgICAgIC8vVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKTtcclxuICAgICAgICAgICAgLy8gU2Vjb25kIHN0YWdlXHJcbiAgICAgICAgICAgIC8vUG9zTm90UG9zc2VkU3R1ZGVudHMoKTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gT1IgSSBjb3VsZCBkbyBpdCB0aGlzIHdheTpcclxuXHJcbiAgICAgICAgICAgIC8vIDEgICAgICAgICAgICBGb3IgYWxsIGRheXMgd2hlcmUgYXQgbGVhc3QgMSB0ZWFjaGVyICsgMSBzdHVkZW50IGhhcyB0aW1lIGFuZCBzb21lb25lIGlzIG5vdCBhc3NpZ25lZCB5ZXRcclxuICAgICAgICAgICAgLy8gMS4xICAgICAgICAgIFBvcyAzIHN0dWRlbnRzIHRoaXMgd2F5OiBQb3Mgc3R1ZGVudCB0aGF0IGNhbiBiZSB0aGVyZSB0aGUgZWFybGllc3QgdGltZS4gSWYgdGhlcmUgaXMgc29tZW9uZSwgdGhhdCBjYW4gYmUgdGhlcmVcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgIDw1MCBtaW51dGVzIGFmdGVyIHRoZSBzdHVkZW50IGFuZCBoYXMgbGVzcyB0aW1lLCBwbGFjZSBoaW0gaW5zdGVhZFxyXG4gICAgICAgICAgICAvLyAxLjIgICAgICAgICAgUGxhY2UgYSBicmVha1xyXG4gICAgICAgICAgICAvLyAxLjMgICAgICAgICAgUGxhY2UgYXMgbWFueSBzdHVkZW50cyBhcyB5b3UgY2FuXHJcblxyXG4gICAgICAgICAgICAvLyAyICAgICAgICAgICAgRm9yIGFsbCB1bmFzc2lnbmVkIHN0dWRlbnRzOlxyXG4gICAgICAgICAgICAvLyAyLjEgICAgICAgICAgR2V0IGFsbCBzdHVkZW50cyB0aGF0IGFyZSBibG9ja2luZyBoaW0uIERvIHRoaXMgZm9yIGFsbCAob3JkZXJlZCBieSBudW1iZXIgb2YgdGltZSkgb2YgdGhlbSB1bmxlc3MgdGhlIHN0dWRlbnQgaXMgcG9zc2VkOlxyXG4gICAgICAgICAgICAvLyAyLjEuMSAgICAgICAgU3dhcCB0aGVzZSBzdHVkZW50cy4gUmVtZW1iZXIgdG8gbW92ZSBvdGhlciBzdHVkZW50cyBiZWhpbmQgaGltIGlmIG5lY2Nlc3NhcnkuIEJlIGNhcmVmdWwgaWYgc29tZW9uZSBsb3NlcyBwb3NpdGlvbiBiZWNhdXNlIG9mIHRoaXNcclxuICAgICAgICAgICAgLy8gMi4xLjIgICAgICAgIElmIHRoZXNlIHN3YXBwZWQgc3R1ZGVudHMgKHRoYXQgZG9uJ3QgaGF2ZSB0aW1lIG5vdykgZG9uJ3QgaGF2ZSBbZGlyZWN0XSBwbGFjZSB0byBzdGF5LCByZXZlcnQgY2hhbmdlc1xyXG4gICAgICAgICAgICAvLyAyLjEuMyAgICAgICAgRWxzZSwgcGxhY2Ugc3R1ZGVudHMgdGhlcmUgYW5kIGdvIGJhY2sgdG8gWzJdXHJcblxyXG5cclxuICAgICAgICAgICAgLy9Qb3NTdHVkZW50cygpO1xyXG4gICAgICAgICAgICAvL0lEb250Q2FyZUp1c3RQb3NzU3R1ZGVudHMoKTsgLy8gVEhJUyBXQVNOVCBDT01NRU5URURcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gVVNJTkcgRkxPV1M6XHJcblxyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRG9JdFVzaW5nRmxvd3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoZXgsIExvZy5TZXZlcml0eS5Dcml0aWNhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBUcnlUb1Bvc0FsbFN0dWRlbnRzVmVyMigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNUb2RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWRIb3VycyA9IDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgbWludXRlQnJlYWsgPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0dWRlbnRzVG9kYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTXV6ZSBzZSBzdGF0LCB6ZSB0ZW4gc3R1ZGVudCBzIG5lam1pbiB2ZWxueWhvIGNhc3UgYnVkZSBtZXJtb21vY2kgdmVwcmVkdSBhIGJ1ZGUgYmxva292YXQgbWlzdG8gcHJvIGppbnlobywgaSBrZHl6IGJ5IHNlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdiBwb2hvZGUgdmVzZWwgamVzdGUgZG96YWR1LiBUcmViYSBBIG1hIG1pbiBjYXN1IG5leiBCLiBBOiAxMjozMC0xNTowMCwgQjogMTI6MDAtMTc6MDAsIHZ5c2xlZGVrIGJ1ZGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBBOiAxMjozMC0xMzoyMCwgQjogMTM6MjAtMTQ6MTAgTUlTVE8gQiA6MTI6MDAgLSAxMjo1MCwgQTogMTI6NTAtMTM6NDBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgbWludXRlID0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldOyBtaW51dGUgPD0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzVG9BdmFpbGFibGVbZGF5XTsgbWludXRlICs9IDUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID4gbWludXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gLSA1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIDwgbWludXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWludXRlID49IG1pbnV0ZUJyZWFrICYmIG1pbnV0ZSA8PSBtaW51dGVCcmVhayArIGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkICYmIHguYXNzaWduZWREYXkgPT0gZGF5ICYmIHguYXNzaWduZWRNaW51dGVzID49IG1pbnV0ZSAtIGxlc3Nvbkxlbmd0aCAmJiB4LmFzc2lnbmVkTWludXRlcyA8PSBtaW51dGUgKyBsZXNzb25MZW5ndGgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHVkZW50c0luVGhpc1RpbWVGcmFtZS5Db3VudCgpID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzVG9kYXlbaV0uYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkTWludXRlcyA9IG1pbnV0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3NzZWRIb3VycyA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMgPSBpbnQuTWluVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2cuV3JpdGUoU3RyaW5nLkpvaW4oXCIsIFwiLCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHguYXNzaWduZWRNaW51dGVzKSkuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkuVG9BcnJheSgpKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50IG1pbnV0ZU9mTGFzdFBvc3NlZFN0dWRlbnRUb2RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzVG9kYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5hc3NpZ25lZE1pbnV0ZXMpKS5Ub0FycmF5KClbMl0uYXNzaWduZWRNaW51dGVzICsgbGVzc29uTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlQnJlYWsgPSBtaW51dGVPZkxhc3RQb3NzZWRTdHVkZW50VG9kYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSBtaW51dGVCcmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBQb3NOb3RQb3NzZWRTdHVkZW50cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgdW5wb3NzZWRTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoc3R1ZGVudCA9PiAhc3R1ZGVudC5hc3NpZ25lZCkpLlRvTGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVucG9zc2VkU3R1ZGVudHMuQ291bnQgPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGJvb2wgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChjaGFuZ2UpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLy8gUGljayBvbmUgb2YgdW5wb3NlZCBzdHVkZW50cyB3aXRoIGxvd2VzdCBudW1iZXIgb2YgcG9zc2libGUgaG91cnNcclxuICAgICAgICAgICAgICAgIGludCBsb3dlc3RTdHVkZW50SW5kZXggPSAtMTtcclxuICAgICAgICAgICAgICAgIGludCBsb3dlc3RTdHVkZW50TWludXRlcyA9IGludC5NYXhWYWx1ZTtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgdW5wb3NzZWRTdHVkZW50cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFVzZXIgcyA9IHVucG9zc2VkU3R1ZGVudHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IG1pbnV0ZXMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlcyArPSBzLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gcy5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWludXRlcyA8IGxvd2VzdFN0dWRlbnRNaW51dGVzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0U3R1ZGVudEluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG93ZXN0U3R1ZGVudE1pbnV0ZXMgPSBtaW51dGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFVzZXIgc2VsZWN0U3R1ZGVudCA9IHVucG9zc2VkU3R1ZGVudHNbbG93ZXN0U3R1ZGVudEluZGV4XTtcclxuXHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBGb3IgYWxsIGRheXMsIHNraXAgZGF5IGlmIGVpdGhlciBhbGwgc3R1ZGVudHMgb3IgdGVhY2hlciBhcmUgYnVzeVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdldCBhbGwgc3R1ZGVudHMgdGhhdCBoYXZlIGF0IGxlYXN0IDUwbWlucyB0aW1lIHRvZGF5IGFuZCBzdGlsbCBkb24ndCBoYXZlIGFueXRoaW5nIGFzc2lnbmVkXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNGb3JUaGlzRGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gbGVzc29uTGVuZ3RoICYmICF4LmFzc2lnbmVkKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDwgbGVzc29uTGVuZ3RoIHx8IC8vIElmIHRoZSB0ZWFjaGVyIGRvbid0IGhhdmUgZnVsbCA1MCBtaW51dGVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzRm9yVGhpc0RheS5MZW5ndGggPT0gMCkgLy8gT3IgaWYgdGhlcmUgaXMgbm8gc3R1ZGVudCB3aXRoIGF0IGxlYXN0IDUwIG1pbnR1ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR28gZm9yIGFsbCB0aGUgdGVhY2hlcidzIG1pbnV0ZXMgdG9kYXlcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNFbGFwc2VkID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3Vyc0VsYXBzZWQgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQgPSBpbnQuTWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzSW5UaGlzVGVybSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzRm9yVGhpc0RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IG1pbnV0ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA+PSBtaW51dGUgKyBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGNob3NlblN0dWRlbnQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0T3JEZWZhdWx0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0luVGhpc1Rlcm0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvc2VuU3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGxlc3Nvbkxlbmd0aCAtIDU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGhvdXJzRWxhcHNlZCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUG9zU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIEFzc3VtaW5nIEkgaGF2ZSBqdXN0IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIHN0dWRlbnRzIHRoYXQgaGF2ZSBhdCBsZWFzdCA1MG1pbnMgdGltZSB0b2RheSBhbmQgc3RpbGwgZG9uJ3QgaGF2ZSBhbnl0aGluZyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzRm9yVGhpc0RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCAmJiAheC5hc3NpZ25lZCkpXHJcbiAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDwgbGVzc29uTGVuZ3RoIHx8ICF0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IHBvc3NlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAvLyBHbyB0aHJ1IGFsbCB0ZWFjaGVyIGhvdXJzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCB0aW1lID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldOyB0aW1lIDw9IHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSBsZXNzb25MZW5ndGg7IHRpbWUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBMZXRzIHRha2UgYSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzZWQgPT0gMylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSA9IHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggLSA1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NzZWQrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIHN0dWRlbnQgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzQXZhaWxhYmxlID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNGb3JUaGlzRGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gdGltZSAmJiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldID49IHRpbWUgKyBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpOyAvLyBUT0RPOiBLZHl6IGpzb3UgZHZhIHNlIHN0ZWpueW1hIGhvZGluYW1hLCB1cHJlZG5vc3RuaXQgdG9obywga2RvIG1hIG1pbiBjYXN1XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKFN0cmluZy5Kb2luKFwiLCBcIiwgc3R1ZGVudHNBdmFpbGFibGUuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lICsgXCI6IFwiICsgeC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFVzZXIgY2hvc2VuU3R1ZGVudCA9IHN0dWRlbnRzQXZhaWxhYmxlLkZpcnN0T3JEZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9zZW5TdHVkZW50ID09IG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkTWludXRlcyA9IHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZSArPSBsZXNzb25MZW5ndGggLSA1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwb3NzZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEJydXRlRm9yY2VTdHVkZW50cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IHJlc3VsdCA9IEJydXRlRm9yY2VTdHVkZW50cyhkYXksIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSwgdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCByZXN1bHQuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXS5zdHVkZW50LmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLnN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXS5zdHVkZW50LmFzc2lnbmVkTWludXRlcyA9IHJlc3VsdFtpXS5taW51dGVzRnJvbTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IEJydXRlRm9yY2VTdHVkZW50cyhpbnQgZGF5LCBpbnQgc3RhcnRUaW1lLCBpbnQgZW5kVGltZSwgaW50IHN0dWRlbnRzUG9zc2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0VGltZSA+PSBlbmRUaW1lIC0gbGVzc29uTGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RhcnRTdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBzdGFydFRpbWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPD0gZW5kVGltZSkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKS5GaXJzdE9yRGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRTdHVkZW50ID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSA1O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJydXRlRm9yY2VTdHVkZW50cyhkYXksIHN0YXJ0VGltZSwgZW5kVGltZSwgc3R1ZGVudHNQb3NzZWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbnQgc3RhcnRTdHVkZW50U3RhcnRUaW1lID0gc3RhcnRTdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07XHJcblxyXG5cclxuICAgICAgICAgICAgc3R1ZGVudHNQb3NzZWQrKztcclxuICAgICAgICAgICAgc3RhcnRUaW1lICs9IGxlc3Nvbkxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKHN0dWRlbnRzUG9zc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgYW5vdGhlclN0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+IHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSAtIGxlc3Nvbkxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIDw9IGVuZFRpbWUgJiYgeCAhPSBzdGFydFN0dWRlbnQpKTtcclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICBMb2cuV3JpdGUoc3RhcnRTdHVkZW50Lm5hbWUgKyBcIixcIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICBMb2cuV3JpdGUoU3RyaW5nLkpvaW4oXCIsXCIsIGFub3RoZXJTdHVkZW50cy5TZWxlY3Q8c3RyaW5nPigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgc3RyaW5nPikoeCA9PiB4Lm5hbWUpKSksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuXHJcbiAgICAgICAgICAgIExpc3Q8TGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+PiBwcmVSZXN1bHQgPSBuZXcgTGlzdDxMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4+KCk7XHJcblxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gcG9zc1Jlc3VsdCA9IG5ldyBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4oKTtcclxuICAgICAgICAgICAgICAgIHBvc3NSZXN1bHQuQWRkKG5ldyBCcnV0ZUZvcmNlZFN0dWRlbnQoc3RhcnRTdHVkZW50U3RhcnRUaW1lLCBzdGFydFN0dWRlbnQpKTtcclxuICAgICAgICAgICAgICAgIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiBuZXdTdHVkZW50cyA9IEJydXRlRm9yY2VTdHVkZW50cyhkYXksIHN0YXJ0VGltZSwgZW5kVGltZSwgc3R1ZGVudHNQb3NzZWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ld1N0dWRlbnRzICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc1Jlc3VsdC5BZGRSYW5nZShuZXdTdHVkZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmVSZXN1bHQuQWRkKHBvc3NSZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciBhbm90aGVyU3R1ZGVudCBpbiBhbm90aGVyU3R1ZGVudHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiBwb3NzaWJsZVJlc3VsdCA9IG5ldyBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4oKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlUmVzdWx0LkFkZChuZXcgQnJ1dGVGb3JjZWRTdHVkZW50KE1hdGguTWF4KHN0YXJ0VGltZSwgYW5vdGhlclN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSksIGFub3RoZXJTdHVkZW50KSk7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gbmV3U3R1ZGVudHMgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdTdHVkZW50cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlUmVzdWx0LkFkZFJhbmdlKG5ld1N0dWRlbnRzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByZVJlc3VsdC5BZGQocG9zc2libGVSZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcblN5c3RlbS5MaW5xLkVudW1lcmFibGUuT3JkZXJCeURlc2NlbmRpbmc8Z2xvYmFsOjpTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5CcnV0ZUZvcmNlZFN0dWRlbnQ+LGludD4oXHJcbiAgICAgICAgICAgIHByZVJlc3VsdCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljLkxpc3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLkJydXRlRm9yY2VkU3R1ZGVudD4sIGludD4pKHggPT4geC5Db3VudCkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3Q8Z2xvYmFsOjpTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5CcnV0ZUZvcmNlZFN0dWRlbnQ+PihwcmVSZXN1bHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIElEb250Q2FyZUp1c3RQb3NzU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIuZGF5c0F2YWlsYWJsZVtkYXldKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBzdGFydFRpbWUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGVuZFRpbWUgPSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBzdHVkZW50c1Bvc3NlZCA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IDA7IG1pbnV0ZSA8IGVuZFRpbWUgLSBzdGFydFRpbWU7KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzUmlnaHROb3cgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5kYXlzQXZhaWxhYmxlW2RheV0gJiYgeC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHN0YXJ0VGltZSArIG1pbnV0ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gc3RhcnRUaW1lICsgbWludXRlICsgbGVzc29uTGVuZ3RoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNSaWdodE5vdy5Db3VudCgpID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50VG9Qb3MgPSBzdHVkZW50c1JpZ2h0Tm93LkZpcnN0KCk7IC8vIFRPRE86IENob29zZSBzb21lb25lIGJldHRlciB3YXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudFRvUG9zLmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudFRvUG9zLmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50VG9Qb3MuYXNzaWduZWRNaW51dGVzID0gc3RhcnRUaW1lICsgbWludXRlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNQb3NzZWQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBsZXNzb25MZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNQb3NzZWQgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSA9IHN0YXJ0VGltZSArIG1pbnV0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBicmVha0FmdGVyTGVzc29uc0xlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEb0l0VXNpbmdGbG93cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBGbG93IGZsb3cgPSBuZXcgRmxvdyh0ZWFjaGVyc1swXSwgc3R1ZGVudHMpO1xyXG4gICAgICAgICAgICAvLyBBbHRlciBmbG93XHJcblxyXG4gICAgICAgICAgICAvKmZsb3cuREVCVUdfQ2xlYXJOb2RlcygpO1xyXG4gICAgICAgICAgICBOb2RlIHJvb3QgPSBuZXcgTm9kZShcIklucHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLklucHV0KTtcclxuICAgICAgICAgICAgTm9kZSBzaW5rID0gbmV3IE5vZGUoXCJPdXRwdXRcIiwgLTEsIE5vZGUuTm9kZVR5cGUuT3V0cHV0KTtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHN0dWRlbnRzIDEgYW5kIDJcclxuICAgICAgICAgICAgTm9kZSBzMSA9IG5ldyBOb2RlKFwiU3R1ZGVudCAxXCIsIC0xLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICBOb2RlIHMyID0gbmV3IE5vZGUoXCJTdHVkZW50IDJcIiwgLTEsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aW1lcyAobm90IG92ZXJsYXBwaW5nKVxyXG4gICAgICAgICAgICBOb2RlIHQxID0gbmV3IE5vZGUoXCJUaW1lICgxMDApXCIsIDEwMCwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgTm9kZSB0MiA9IG5ldyBOb2RlKFwiVGltZSAoNzAwKVwiLCA3MDAsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aW1lIGNodW5rXHJcbiAgICAgICAgICAgIE5vZGUgdGNoID0gbmV3IE5vZGUoXCJUaW1lIENodW5rIE5vZGVcIiwgLTEsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgIC8vIEFkZCBwYXRocyBmcm9tIHJvb3QgdG8gc3R1ZGVudHMgYW5kIGZyb20gdGltZXMgdG8gdGltZWNodW5rIGFuZCBmcm9tIHRpbWVjaHVuayB2aWEgW3RpbWVjaHVua10gdG8gc2lua1xyXG4gICAgICAgICAgICByb290Lk91dHB1dEVkZ2VzLkFkZChuZXcgRWRnZSgxLCAwLCByb290LCBzMSkpO1xyXG4gICAgICAgICAgICByb290Lk91dHB1dEVkZ2VzLkFkZChuZXcgRWRnZSgxLCAwLCByb290LCBzMikpO1xyXG4gICAgICAgICAgICBzMS5JbnB1dEVkZ2VzLkFkZChyb290Lk91dHB1dEVkZ2VzWzBdKTtcclxuICAgICAgICAgICAgczIuSW5wdXRFZGdlcy5BZGQocm9vdC5PdXRwdXRFZGdlc1sxXSk7XHJcblxyXG4gICAgICAgICAgICB0MS5PdXRwdXRFZGdlcy5BZGQobmV3IEVkZ2UoMSwgMCwgdDEsIHRjaCkpO1xyXG4gICAgICAgICAgICB0Mi5PdXRwdXRFZGdlcy5BZGQobmV3IEVkZ2UoMSwgMCwgdDIsIHRjaCkpO1xyXG4gICAgICAgICAgICB0Y2guSW5wdXRFZGdlcy5BZGQodDEuT3V0cHV0RWRnZXNbMF0pO1xyXG4gICAgICAgICAgICB0Y2guSW5wdXRFZGdlcy5BZGQodDEuT3V0cHV0RWRnZXNbMF0pO1xyXG5cclxuICAgICAgICAgICAgdGNoLk91dHB1dEVkZ2VzLkFkZChuZXcgVGltZUNodW5rKHRjaCwgc2luaykpO1xyXG4gICAgICAgICAgICBzaW5rLklucHV0RWRnZXMuQWRkKHRjaC5PdXRwdXRFZGdlc1swXSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCBwYXRocyBmcm9tIHN0dWRlbnRzIHRvIHRpbWVzXHJcbiAgICAgICAgICAgIHMxLk91dHB1dEVkZ2VzLkFkZChuZXcgRWRnZSgxLCAwLCBzMSwgdDEpKTtcclxuICAgICAgICAgICAgczEuT3V0cHV0RWRnZXMuQWRkKG5ldyBFZGdlKDEsIDAsIHMxLCB0MikpO1xyXG5cclxuICAgICAgICAgICAgLy8gQXBwbHkgbmV3IGdyYXBoXHJcbiAgICAgICAgICAgIGZsb3cuTm9kZXMuQWRkUmFuZ2UobmV3IExpc3Q8Tm9kZT4oKSB7IHJvb3QsIHMxLCBzMiwgdDEsIHQyLCB0Y2gsIHNpbmsgfSk7Ki9cclxuICAgICAgICAgICAgLy8gRW5kIG9mIGFsdGVyIGZsb3dcclxuICAgICAgICAgICAgaW50W10gYnJlYWtzID0gZmxvdy5HZXRSZXN1bHQoKTtcclxuICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydCA9IGJyZWFrcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJuYWwgc3RydWN0IEJydXRlRm9yY2VkU3R1ZGVudFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgbWludXRlc0Zyb207XHJcbiAgICAgICAgcHVibGljIFVzZXIgc3R1ZGVudDtcclxuXHJcbiAgICAgICAgcHVibGljIEJydXRlRm9yY2VkU3R1ZGVudChpbnQgbWludXRlc0Zyb20sIFVzZXIgc3R1ZGVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb20gPSBtaW51dGVzRnJvbTtcclxuICAgICAgICAgICAgdGhpcy5zdHVkZW50ID0gc3R1ZGVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBDYXBhY2l0eTtcclxuICAgICAgICBwcml2YXRlIGludCBjdXJyZW50RmxvdztcclxuICAgICAgICBwdWJsaWMgTm9kZSBGcm9tO1xyXG4gICAgICAgIHB1YmxpYyBOb2RlIFRvO1xyXG5cclxuICAgICAgICBwdWJsaWMgRWRnZShpbnQgY2FwYWNpdHksIGludCBjdXJyZW50RmxvdywgTm9kZSBmcm9tLCBOb2RlIHRvKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2FwYWNpdHkgPSBjYXBhY2l0eTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RmxvdyA9IGN1cnJlbnRGbG93O1xyXG4gICAgICAgICAgICBGcm9tID0gZnJvbTtcclxuICAgICAgICAgICAgVG8gPSB0bztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIGludCBHZXRDdXJyZW50RmxvdyhJRW51bWVyYWJsZTxOb2RlPiBjdXJyZW50UGF0aCwgRmxvdyBmbG93LCBzdHJpbmcgaW5mbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50RmxvdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIHZvaWQgU2V0Q3VycmVudEZsb3coaW50IG5ld1ZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudEZsb3cgPSBuZXdWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3dcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEZsb3dcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgTGlzdDxOb2RlPiBOb2RlcyB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBVc2VyIHRlYWNoZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFVzZXI+IHN0dWRlbnRzO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBTdHVkZW50IG5hbWUgbXVzdCBOT1QgY29udGFpbiB0aGlzIGNoYXIgLT4gOlxyXG4gICAgICAgIHB1YmxpYyBGbG93KFVzZXIgdGVhY2hlciwgTGlzdDxVc2VyPiBzdHVkZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhY2hlciA9IHRlYWNoZXI7XHJcbiAgICAgICAgICAgIHRoaXMuc3R1ZGVudHMgPSBzdHVkZW50cztcclxuICAgICAgICAgICAgdGhpcy5Ob2RlcyA9IG5ldyBMaXN0PE5vZGU+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBERUJVR19DbGVhck5vZGVzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5vZGVzLkNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAgICAgLy8vIEdldHMgcmVzdWx0IHVzaW5nIGZsb3dzLiBUaGlzIG1ldGhvZCB3aWxsIHNldCBzdHVkZW50IGFzc2lnbmVkIHRpbWVzIGFuZCByZXR1cm4gYXJyYXkgb2YgbWludXRlcywgd2hlbiBpcyBicmVhayB0aW1lIGVhY2ggZGF5XHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHJldHVybnM+PC9yZXR1cm5zPlxyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBHZXRSZXN1bHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50W10gYnJlYWtzID0gbmV3IGludFs1XTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoc3RyaW5nLkZvcm1hdChcIj09PT09PT09PT09PT09PT09PT1EQVk6IHswfT09PT09PT09PT09PT09XCIsZGF5KSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgQnVpbGRHcmFwaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgU3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkRvbmUuLi5cIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzVG9kYXkgPSBHZXRSZXN1bHRGcm9tR3JhcGgoZGF5KTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlIHRoZW4gdGhyZWUgc3R1ZGVudHMgdG9kYXk6XHJcbiAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNUb2RheS5Db3VudCA+IDMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBmaXJzdCB0aHJlZSBzdHVkZW50IHRpbWVzXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCAzOyBpKyspIEFwcGx5U3R1ZGVudChzdHVkZW50c1RvZGF5W2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBEaXNhYmxlIG1pbnV0ZXMgYW5kIHJlY29yZCBicmVhayB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtzW2RheV0gPSBzdHVkZW50c1RvZGF5WzJdLnRpbWVTdGFydCArIDUwO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGFnYWluIChyZW1vdmUgZmlyc3QgdHdvIHN0dWRlbnRzIGFuZCB0aGVpciB0aW1lcylcclxuICAgICAgICAgICAgICAgICAgICBCdWlsZEdyYXBoKGRheSwgYnJlYWtzW2RheV0sIGJyZWFrc1tkYXldICsgUGxhbi5icmVha0FmdGVyTGVzc29uc0xlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgU3RhcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5ID0gR2V0UmVzdWx0RnJvbUdyYXBoKGRheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtzW2RheV0gPSBpbnQuTWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgYWxsIHN0dWRlbnRzXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChBc3NpZ25tZW50UHJldmlldyByZXN1bHQgaW4gc3R1ZGVudHNUb2RheSkgQXBwbHlTdHVkZW50KHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIkJyZWFrOiBcIiArIFN0cmluZy5Kb2luPGludD4oXCIsIFwiLCBicmVha3MpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnJlYWtzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEJ1aWxkR3JhcGgoaW50IGRheSwgaW50IGJhbm5lZFRpbWVzcGFuRnJvbSA9IC0xLCBpbnQgYmFubmVkVGltZXNwYW5UbyA9IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTm9kZXMuQ2xlYXIoKTtcclxuICAgICAgICAgICAgLy8gQWRkIHJvb3Qgbm9kZVxyXG4gICAgICAgICAgICBOb2RlIHJvb3QgPSBuZXcgTm9kZShcIklucHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLklucHV0KTtcclxuICAgICAgICAgICAgTm9kZXMuQWRkKHJvb3QpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGFsbCBzdHVkZW50cyBub2Rlc1xyXG4gICAgICAgICAgICBmb3JlYWNoIChVc2VyIHN0dWRlbnQgaW4gc3R1ZGVudHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzdHVkZW50LmFzc2lnbmVkIHx8ICFzdHVkZW50LmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBFcnJvciB3aGVuIG11bHRpcGxlIHN0dWRlbnRzIHdpdGggc2FtZSBuYW1lXHJcbiAgICAgICAgICAgICAgICBOb2RlIHN0dWRlbnROb2RlID0gbmV3IE5vZGUoXCJTdHVkZW50OlwiICsgc3R1ZGVudC5uYW1lLCAtMSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIklucHV0XCIsIHN0dWRlbnROb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGFyZSB0aW1lIGNodW5rIG5vZGVcclxuICAgICAgICAgICAgTm9kZSB0aW1lQ2h1bmsgPSBuZXcgTm9kZShcIlRpbWVDaHVua1wiLCAtMSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBvY2N1cGllZFRpbWVzVG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5hc3NpZ25lZERheSA9PSBkYXkpKS5TZWxlY3Q8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50Pikoc3R1ZGVudCA9PiBzdHVkZW50LmFzc2lnbmVkTWludXRlcykpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGFsbCB0aW1lcyBub2Rlc1xyXG4gICAgICAgICAgICBmb3IgKGludCB0aW1lID0gMDsgdGltZSA8IDI0ICogNjA7IHRpbWUgKz0gNSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHRpbWUgaXMgYmFubmVkIG9yIHNvbWVvbmUgYWxyZWFkeSBwb3NpdGlvbmVkIHVzZWQgdGhlIHRpbWUsIHNraXAgdG8gbmV4dCB0aW1lXHJcbiAgICAgICAgICAgICAgICBpZiAoKHRpbWUgPj0gYmFubmVkVGltZXNwYW5Gcm9tICYmIHRpbWUgPD0gYmFubmVkVGltZXNwYW5UbykgfHxcclxuICAgICAgICAgICAgICAgICAgICBvY2N1cGllZFRpbWVzVG9kYXkuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8aW50LCBib29sPikob2NjVGltZSA9PiBNYXRoLkFicyhvY2NUaW1lIC0gdGltZSkgPCA1MCkpLkNvdW50KCkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gdGltZSAmJiB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gUGxhbi5sZXNzb25MZW5ndGggPj0gdGltZSlcclxuICAgICAgICAgICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzQXRUaGlzVGltZSA9IC8qIFN0dWRlbnRzIHRoYXQgaGF2ZSB0aW1lIHJpZ2h0IG5vdyAqLyBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gIXN0dWRlbnQuYXNzaWduZWQgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQuZGF5c0F2YWlsYWJsZVtkYXldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPD0gdGltZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIFBsYW4ubGVzc29uTGVuZ3RoID49IHRpbWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZSB0aW1lTm9kZSA9IG5ldyBOb2RlKFwiVGltZTpcIiArIHRpbWUsIHRpbWUsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciBzdHVkZW50IGluIHN0dWRlbnRzQXRUaGlzVGltZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIlN0dWRlbnQ6XCIgKyBzdHVkZW50Lm5hbWUsIHRpbWVOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgQWRkTm9kZUFmdGVyKFwiVGltZTpcIiArIHRpbWUsIHRpbWVDaHVuayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENvbm5lY3QgVGltZSBDaHVuayB3aXRoIG91dHB1dFxyXG4gICAgICAgICAgICBOb2RlIG91dHB1dCA9IG5ldyBOb2RlKFwiT3V0cHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLk91dHB1dCk7XHJcbiAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIlRpbWVDaHVua1wiLCBvdXRwdXQpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hhbmdlIGVkZ2UgYmV0d2VlbiBUaW1lQ2h1bmsoTm9kZSkgYW5kIE91dHB1dCB0byBUaW1lQ2h1bmsoRWRnZSlcclxuICAgICAgICAgICAgVGltZUNodW5rIHRpbWVDaHVua0VkZ2UgPSBuZXcgVGltZUNodW5rKHRpbWVDaHVuaywgb3V0cHV0KTtcclxuICAgICAgICAgICAgdGltZUNodW5rLk91dHB1dEVkZ2VzLkNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRpbWVDaHVuay5PdXRwdXRFZGdlcy5BZGQodGltZUNodW5rRWRnZSk7XHJcbiAgICAgICAgICAgIG91dHB1dC5JbnB1dEVkZ2VzLkNsZWFyKCk7XHJcbiAgICAgICAgICAgIG91dHB1dC5JbnB1dEVkZ2VzLkFkZCh0aW1lQ2h1bmtFZGdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBZGROb2RlQWZ0ZXIoc3RyaW5nIGlkZW50aWZpZXIsIE5vZGUgbmV3Tm9kZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbm9kZSBpbiBOb2RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuSWRlbnRpZmllciA9PSBpZGVudGlmaWVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIEVkZ2UgbmV3RWRnZSA9IG5ldyBFZGdlKDEsIDAsIG5vZGUsIG5ld05vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuT3V0cHV0RWRnZXMuQWRkKG5ld0VkZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld05vZGUuSW5wdXRFZGdlcy5BZGQobmV3RWRnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFOb2Rlcy5Db250YWlucyhuZXdOb2RlKSlcclxuICAgICAgICAgICAgICAgIE5vZGVzLkFkZChuZXdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTdGFydCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBXaGlsZSB3ZSBhcmUgY3JlYXRpbmcgbmV3IGZsb3csIGtlZXAgZG9pbmcgaXRcclxuICAgICAgICAgICAgd2hpbGUgKENyZWF0ZU5ld0Zsb3coKSkgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBib29sIENyZWF0ZU5ld0Zsb3coKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gRmlyc3Qgb2YgYWxsLCBsZXQncyBjcmVhdGUgYSBkaWN0aW9uYXJ5LCB3aGVuIHdlJ2xsIHN0b3JlIGN1cnJlbnRseSBjaG9zZW4gcGF0aFxyXG4gICAgICAgICAgICBEaWN0aW9uYXJ5PE5vZGUsIE5vZGVzUGF0aENvbGxlY3Rpb24+IE5vZGVzUGF0aCA9IG5ldyBEaWN0aW9uYXJ5PE5vZGUsIE5vZGVzUGF0aENvbGxlY3Rpb24+KCk7XHJcbiAgICAgICAgICAgIC8vIEFkZCBrZXlzIGFuZCBudWxsXHJcbiAgICAgICAgICAgIE5vZGVzLkZvckVhY2goKGdsb2JhbDo6U3lzdGVtLkFjdGlvbjxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4pKG5vZGUgPT4gTm9kZXNQYXRoLkFkZChub2RlLCBuZXcgTm9kZXNQYXRoQ29sbGVjdGlvbigpKSkpO1xyXG5cclxuICAgICAgICAgICAgLy8gTGV0J3Mgc3RhcnQgcHJvY2Vzc2luZyBub2Rlc1xyXG4gICAgICAgICAgICBRdWV1ZTxOb2RlPiBub2Rlc1RvUHJvY2VzcyA9IG5ldyBRdWV1ZTxOb2RlPigpO1xyXG4gICAgICAgICAgICBub2Rlc1RvUHJvY2Vzcy5FbnF1ZXVlKE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgTm9kZXNQYXRoW05vZGVzWzBdXS5Ob2Rlcy5BZGQobmV3IE5vZGUoXCJJbnB1dCBQbGFjZWhvbGRlclwiLCAtMSwgTm9kZS5Ob2RlVHlwZS5JbnB1dCkpO1xyXG5cclxuICAgICAgICAgICAgLy8gV2hpbGUgdGhlcmUncyBzb21ldGhpbmcgdG8gcHJvY2VzcywgcHJvY2VzcyBpdFxyXG4gICAgICAgICAgICB3aGlsZSAobm9kZXNUb1Byb2Nlc3MuQ291bnQgPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBieSBnZXR0aW5nIG5vZGUgZnJvbSB0aGUgcXVldWVcclxuICAgICAgICAgICAgICAgIE5vZGUgbm9kZSA9IG5vZGVzVG9Qcm9jZXNzLkRlcXVldWUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbmQgZ2V0IGN1cnJlbnQgcGF0aFxyXG4gICAgICAgICAgICAgICAgTGlzdDxOb2RlPiBwYXRoID0gUmVuZGVyUGF0aChOb2Rlc1swXSwgbm9kZSwgTm9kZXNQYXRoKTtcclxuICAgICAgICAgICAgICAgIC8vIE5vdyB3ZSBuZWVkIHRvIGdldCBuZXh0IG5vZGVzIGZyb20gdGhpcyBub2RlLi4uXHJcbiAgICAgICAgICAgICAgICB2YXIgbmV4dE5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5PdXRwdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhwYXRoLCB0aGlzLCBcIkdldHRpbmcgb3V0cHV0IG5vZGVzXCIpID09IDApKTtcclxuICAgICAgICAgICAgICAgIC8vIEFuZCBnZXQgcHJldmlvdXMgbm9kZXNcclxuICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c05vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KHBhdGgsIHRoaXMsIFwiR2V0dGluZyBpbnB1dCBub2Rlc1wiKSA9PSAxKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgdGhlIG5vZGVzIHRvIG9ubHkgYWxsb3cgdGhvc2UgdGhhdCBhcmUgbm90IGluIGFscmVhZHlQcm9jZXNzZWROb2Rlc1xyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGVzID0gbmV4dE5vZGVzLldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikobmV3Tm9kZSA9PiBOb2Rlc1BhdGhbbmV3Tm9kZS5Ub10uTm9kZXMuQ291bnQgPT0gMCB8fCAobmV3Tm9kZS5Uby5JZGVudGlmaWVyID09IFwiVGltZUNodW5rXCIgJiYgTm9kZXNQYXRoW25ld05vZGUuVG9dLlNlbGVjdGVkTm9kZSA9PSBudWxsKSkpO1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNOb2RlcyA9IHByZXZpb3VzTm9kZXMuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShuZXdOb2RlID0+IE5vZGVzUGF0aFtuZXdOb2RlLkZyb21dID09IG51bGwpKTtcclxuICAgICAgICAgICAgICAgIC8vIEFkZCBhbGwgdGhlc2Ugbm9kZXMgdG8gcXVldWVcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbmV3Tm9kZSBpbiBuZXh0Tm9kZXMuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgZ2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KShlZGdlID0+IGVkZ2UuVG8pKS5VbmlvbihwcmV2aW91c05vZGVzLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPikoZWRnZSA9PiBlZGdlLkZyb20pKSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNUb1Byb2Nlc3MuRW5xdWV1ZShuZXdOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBOb2Rlc1BhdGhbbmV3Tm9kZV0uTm9kZXMuQWRkKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZS5JZGVudGlmaWVyID09IFwiVGltZUNodW5rXCIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcGF0aCBtYXkgZ28gdGhyb3VnaCB0aW1lIGNodW5rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvb2wgY2FuUGFzcyA9IG5ld05vZGUuT3V0cHV0RWRnZXNbMF0uR2V0Q3VycmVudEZsb3cocGF0aCwgdGhpcywgXCJBZGRpbmcgU2VsZWN0ZWROb2RlXCIpID09IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FuUGFzcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5vZGVzUGF0aFtuZXdOb2RlXS5TZWxlY3RlZE5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTm93LCBJIChwcm9iYWJseSkgaGF2ZSBmbG93XHJcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihOb2Rlc1BhdGguS2V5cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKHggPT4geC5JZGVudGlmaWVyID09IFwiT3V0cHV0XCIpKS5TaW5nbGVPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKG91dHB1dCA9PSBudWxsIHx8IE5vZGVzUGF0aFtvdXRwdXRdLk5vZGVzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIE5vIGZsb3dcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkZhaWx1cmU6XCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIlN1Y2Nlc3NcIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgQXBwbHlGbG93KFJlbmRlclBhdGgoTm9kZXNbMF0sIG91dHB1dCwgTm9kZXNQYXRoKSk7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUodGhpcywgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBcHBseUZsb3coTGlzdDxOb2RlPiBwYXRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihwYXRoKSAtIDE7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IG5vZGU6bmV4dE5vZGVcclxuICAgICAgICAgICAgICAgIE5vZGUgcHJldk5vZGUgPSBwYXRoW2ldO1xyXG4gICAgICAgICAgICAgICAgTm9kZSBuZXh0Tm9kZSA9IHBhdGhbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdyBzZXQgdGhlIGVkZ2UgYmV0d2VlbiB0aGVtIHRvIHRoZSBvcHBvc2l0ZSB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgRWRnZSBlZGdlQmV0d2Vlbk5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5VbmlvbjxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4ocHJldk5vZGUuT3V0cHV0RWRnZXMscHJldk5vZGUuSW5wdXRFZGdlcykuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuRnJvbSA9PSBuZXh0Tm9kZSB8fCBlZGdlLlRvID09IG5leHROb2RlKSkuU2luZ2xlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShlZGdlQmV0d2Vlbk5vZGVzIGlzIFRpbWVDaHVuaykpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZUJldHdlZW5Ob2Rlcy5TZXRDdXJyZW50RmxvdyhlZGdlQmV0d2Vlbk5vZGVzLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwsIFwiRmxvdyBBcHBseVwiKSA9PSAwID8gMSA6IDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIExpc3Q8Tm9kZT4gUmVuZGVyUGF0aChOb2RlIHJvb3ROb2RlLCBOb2RlIGVuZE5vZGUsIERpY3Rpb25hcnk8Tm9kZSwgTm9kZXNQYXRoQ29sbGVjdGlvbj4gZmxvd1BhdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMaXN0PE5vZGU+IHBhdGggPSBuZXcgTGlzdDxOb2RlPigpO1xyXG4gICAgICAgICAgICBwYXRoLkFkZChlbmROb2RlKTtcclxuXHJcbiAgICAgICAgICAgIE5vZGUgbmV4dE5vZGUgPSBlbmROb2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAobmV4dE5vZGUgIT0gcm9vdE5vZGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXh0Tm9kZSA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFzIG5leHROb2RlLCBzZWxlY3QgZWl0aGVyIFNlbGVjdGVkTm9kZSwgb3IsIGlmIGl0IGlzIG51bGwsIGZpcnN0IGVsZW1lbnQgb2YgTm9kZXMgbGlzdFxyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV0uU2VsZWN0ZWROb2RlID8/IGZsb3dQYXRoW25leHROb2RlXS5Ob2Rlc1swXTtcclxuICAgICAgICAgICAgICAgIHBhdGguQWRkKG5leHROb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGF0aC5SZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PEFzc2lnbm1lbnRQcmV2aWV3PiBHZXRSZXN1bHRGcm9tR3JhcGgoaW50IGRheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIlN0YXJ0aW5nIEdldFJlc3VsdEZyb21HcmFwaFwiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGltZU5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IG5vZGUuVmFsdWUgIT0gLTEpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB1c2VkVGltZU5vZGVzID0gdGltZU5vZGVzLldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobm9kZSA9PiBub2RlLklucHV0RWRnZXMuQ291bnQgIT0gMCkpO1xyXG5cclxuICAgICAgICAgICAgTG9nLldyaXRlKFwiVGltZSBub2RlcyB0b3RhbDogXCIgKyB1c2VkVGltZU5vZGVzLkNvdW50KCksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuXHJcbiAgICAgICAgICAgIC8vdmFyIGVkZ2VzID0gdXNlZFRpbWVOb2Rlcy5TZWxlY3Qobm9kZSA9PiBub2RlLklucHV0RWRnZXMuV2hlcmUoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwpID09IDEpLlNpbmdsZSgpKTtcclxuICAgICAgICAgICAgdmFyIGVkZ2VzID0gdXNlZFRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwsIFwiR2V0UmVzdWx0XCIpID09IDEpKS5Db3VudCgpID09IDEpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPikobm9kZSA9PiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPihub2RlLklucHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuR2V0Q3VycmVudEZsb3cobnVsbCwgbnVsbCwgXCJHZXRSRXN1bHQyXCIpID09IDEpKS5TaW5nbGUoKSkpO1xyXG5cclxuICAgICAgICAgICAgTG9nLldyaXRlKFwiVGltZSBub2RlcyB3aXRoIHNlbGVjdGVkIGVkZ2U6IFwiICsgZWRnZXMuQ291bnQoKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGVkZ2VzLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRmxvdy5Bc3NpZ25tZW50UHJldmlldz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5GbG93LkFzc2lnbm1lbnRQcmV2aWV3PikoZWRnZSA9PiBuZXcgQXNzaWdubWVudFByZXZpZXcoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBhc3NpZ25lZFN0dWRlbnQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5uYW1lID09IGVkZ2UuRnJvbS5JZGVudGlmaWVyLlNwbGl0KCc6JylbMV0pKS5TaW5nbGUoKSxcclxuICAgICAgICAgICAgICAgIGRheSA9IGRheSxcclxuICAgICAgICAgICAgICAgIHRpbWVTdGFydCA9IGVkZ2UuVG8uVmFsdWVcclxuICAgICAgICAgICAgfSkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRmxvdy5Bc3NpZ25tZW50UHJldmlldywgaW50PikocmVzdWx0ID0+IHJlc3VsdC50aW1lU3RhcnQpKS5Ub0xpc3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBcHBseVN0dWRlbnQoQXNzaWdubWVudFByZXZpZXcgcmVzdWx0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0LmFzc2lnbmVkU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC5hc3NpZ25lZFN0dWRlbnQuYXNzaWduZWREYXkgPSByZXN1bHQuZGF5O1xyXG4gICAgICAgICAgICByZXN1bHQuYXNzaWduZWRTdHVkZW50LmFzc2lnbmVkTWludXRlcyA9IHJlc3VsdC50aW1lU3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIEVkZ2VJbmZvIEdldEVkZ2VJbmZvKE5vZGUgbm9kZTEsIE5vZGUgbm9kZTIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBFZGdlSW5mbyByZXN1bHQgPSBuZXcgRWRnZUluZm8oKTtcclxuICAgICAgICAgICAgRWRnZSBlZGcgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPihub2RlMS5PdXRwdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5UbyA9PSBub2RlMikpLkZpcnN0T3JEZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQuSXNGcm9tTm9kZTFUb05vZGUyID0gZWRnICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWRnID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVkZyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUxLklucHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuRnJvbSA9PSBub2RlMikpLkZpcnN0T3JEZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5SZXN1bHRFZGdlID0gZWRnO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RydWN0IEVkZ2VJbmZvXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwdWJsaWMgRWRnZSBSZXN1bHRFZGdlO1xyXG4gICAgICAgICAgICBwdWJsaWMgYm9vbCBJc0Zyb21Ob2RlMVRvTm9kZTI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0cnVjdCBBc3NpZ25tZW50UHJldmlld1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcHVibGljIGludCB0aW1lU3RhcnQ7XHJcbiAgICAgICAgICAgIHB1YmxpYyBpbnQgZGF5O1xyXG4gICAgICAgICAgICBwdWJsaWMgVXNlciBhc3NpZ25lZFN0dWRlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBjb21tYW5kID0gXCJncmFwaCBMUlxcclxcblwiO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTm9kZSBuIGluIE5vZGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChFZGdlIG91dHB1dEVkZ2UgaW4gbi5PdXRwdXRFZGdlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kICs9IHN0cmluZy5Gb3JtYXQoXCJ7MH0gLS0+fHsxfXwgezJ9XFxyXFxuXCIsb3V0cHV0RWRnZS5Gcm9tLklkZW50aWZpZXIsb3V0cHV0RWRnZS5HZXRDdXJyZW50RmxvdyhuZXcgTm9kZVswXSwgdGhpcywgXCJUaGlzVG9TdHJpbmdcIiksb3V0cHV0RWRnZS5Uby5JZGVudGlmaWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb21tYW5kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLy8gPHN1bW1hcnk+XHJcbiAgICAvLy8gVGhpcyBpcyB1c2VkIGFzIHZhbHVlIGluIE5vZGVzUGF0aFxyXG4gICAgLy8vIDwvc3VtbWFyeT5cclxuICAgIGNsYXNzIE5vZGVzUGF0aENvbGxlY3Rpb25cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgTGlzdDxOb2RlPiBOb2RlcztcclxuICAgICAgICBwdWJsaWMgTm9kZSBTZWxlY3RlZE5vZGU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBOb2Rlc1BhdGhDb2xsZWN0aW9uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5vZGVzID0gbmV3IExpc3Q8Tm9kZT4oKTtcclxuICAgICAgICAgICAgU2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3dcclxue1xyXG4gICAgcHVibGljIGNsYXNzIE5vZGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgZW51bSBOb2RlVHlwZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRGVmYXVsdCxcclxuICAgICAgICAgICAgSW5wdXQsXHJcbiAgICAgICAgICAgIE91dHB1dFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBJZGVudGlmaWVyO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgVmFsdWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBMaXN0PEVkZ2U+IElucHV0RWRnZXM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8RWRnZT4gT3V0cHV0RWRnZXM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBOb2RlVHlwZSBUeXBlO1xyXG5cclxuICAgICAgICBwdWJsaWMgTm9kZShzdHJpbmcgaWRlbnRpZmllciwgaW50IHZhbHVlLCBOb2RlVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSWRlbnRpZmllciA9IGlkZW50aWZpZXI7XHJcbiAgICAgICAgICAgIFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuSW5wdXRFZGdlcyA9IG5ldyBMaXN0PEVkZ2U+KCk7XHJcbiAgICAgICAgICAgIHRoaXMuT3V0cHV0RWRnZXMgPSBuZXcgTGlzdDxFZGdlPigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVXNlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgcHVibGljIGJvb2wgYXNzaWduZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0SG91cnNJbkRheShpbnQgZGF5SW5kZXgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF5SW5kZXggPCAwIHx8IGRheUluZGV4ID49IDUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oXCJQYXJhbWV0ZXIgTVVTVCBCRSBpbiByYW5nZSBbMDsgNSkuIFZhbHVlOiBcIiArIGRheUluZGV4LCBcImRheUluZGV4XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2RheUluZGV4XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiO1xyXG5cclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNGID0gbWludXRlc0Zyb21BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG4gICAgICAgICAgICBpbnQgbWludXRlc1QgPSBtaW51dGVzVG9BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgaW50IGhvdXJzRiA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzRiAvIDYwZCk7XHJcbiAgICAgICAgICAgIGludCBob3Vyc1QgPSAoaW50KU1hdGguRmxvb3IobWludXRlc1QgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJPZCB7MH06ezF9IGRvIHsyfTp7M31cIixob3Vyc0YsKG1pbnV0ZXNGIC0gaG91cnNGICogNjApLlRvU3RyaW5nKFwiMDBcIiksaG91cnNULChtaW51dGVzVCAtIGhvdXJzVCAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlclxyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIExvZ1xyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGludCBsZW5ndGhDb2xsYXBzZVN0YXJ0ID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGludCBwcmV2aWV3TGVuZ3RoID0gMzA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBlbnVtIFNldmVyaXR5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBJbmZvLFxyXG4gICAgICAgICAgICBXYXJuaW5nLFxyXG4gICAgICAgICAgICBDcml0aWNhbFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTERpdkVsZW1lbnQgdGFyZ2V0O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgSW5pdGlhbGl6ZVdpdGhEaXYoSFRNTERpdkVsZW1lbnQgdGFyZ2V0RGl2KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0RGl2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBXcml0ZShvYmplY3QgbywgU2V2ZXJpdHkgc2V2ZXJpdHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBMb2cgb2JqZWN0IHRvIGphdmFzY3JpcHQgY29uc29sZVxyXG4gICAgICAgICAgICBCcmlkZ2UuU2NyaXB0LkNhbGwoXCJjb25zb2xlLmxvZ1wiLCBvKTtcclxuICAgICAgICAgICAgLy8gTG9nIG9iamVjdCB3aXRoIHNldmVyaXR5IHRvIHRoZSBkaXZcclxuICAgICAgICAgICAgc3RyaW5nIHRleHQgPSBvLlRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBzdHJpbmcgaHRtbCA9IFN0cmluZy5FbXB0eTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHRleHQgaXMgdmVyeSBsb25nLCBjb2xsYXBzZSBpdFxyXG4gICAgICAgICAgICBpZih0ZXh0Lkxlbmd0aCA+IGxlbmd0aENvbGxhcHNlU3RhcnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc3RyaW5nIHByZXZpZXcgPSB0ZXh0LlN1YnN0cmluZygwLCBwcmV2aWV3TGVuZ3RoKSArIFwiLi4uXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sID0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2xvZ0V4cGFuZGFibGUnIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS10YXJnZXQ9JyNjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPlwiICsgXCI8cCBzdHlsZT0nY29sb3I6IFwiICsgR2V0Q29sb3JCYXNlZE9uU2V2ZXJpdHkoc2V2ZXJpdHkpICsgXCI7Jz5cIiArIHByZXZpZXcgKyBcIjwvcD48L2Rpdj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPSdjb2xsYXBzZSByb3cnIGlkPSdjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPjxkaXYgY2xhc3M9J2NhcmQgY2FyZC1ib2R5Jz5cIiArIHRleHQgKyBcIjwvZGl2PjwvZGl2PlwiO1xyXG4gICAgICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IFwiPHAgc3R5bGU9J2NvbG9yOiBcIiArIEdldENvbG9yQmFzZWRPblNldmVyaXR5KHNldmVyaXR5KSArIFwiOyc+XCIgKyB0ZXh0ICsgXCI8cD5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgV3JpdGVUb0RlYnVnKGh0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBXcml0ZVRvRGVidWcoc3RyaW5nIGh0bWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQuSW5uZXJIVE1MICs9IGh0bWwgKyBcIjxociAvPlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIEdldENvbG9yQmFzZWRPblNldmVyaXR5KFNldmVyaXR5IHNldmVyaXR5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoIChzZXZlcml0eSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTZXZlcml0eS5JbmZvOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNldmVyaXR5Lldhcm5pbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiR3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgU2V2ZXJpdHkuQ3JpdGljYWw6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiUmVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUaW1lQ2h1bmsgOiBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFRpbWVDaHVuayhOb2RlIGZyb20sIE5vZGUgdG8pIDogYmFzZSgwLCAwLCBmcm9tLCB0bykgeyB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW50IEdldEJsb2NraW5nTm9kZXMoSUVudW1lcmFibGU8Tm9kZT4gdGltZU5vZGVzLCBOb2RlIGJhc2VOb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGJsb2NraW5nTm9kZXMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KSh0Tm9kZSA9PiBNYXRoLkFicyh0Tm9kZS5WYWx1ZSAtIGJhc2VOb2RlLlZhbHVlKSA8IDUwKSkuQ291bnQoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChibG9ja2luZ05vZGVzID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkganVzdCBwYXNzZWQgd2l0aCB0aGlzIHNldHRpbmdzOiBcIiArIFN0cmluZy5Kb2luKFwiICwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4odGltZU5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBzdHJpbmc+KShub2RlID0+IG5vZGUuSWRlbnRpZmllciArIFwiIHdpdGggdmFsdWUgXCIgKyBub2RlLlZhbHVlKSkpICsgXCIuIEJhc2Ugd2FzIFwiICsgYmFzZU5vZGUuSWRlbnRpZmllciArIFwiIHdpdGggdmFsdWUgXCIgKyBiYXNlTm9kZS5WYWx1ZSwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkgZGlkbid0IHBhc3Mgd2l0aCB0aGlzIHNldHRpbmdzOlwiICsgU3RyaW5nLkpvaW4oXCIgLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsc3RyaW5nPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKG5vZGUgPT4gbm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIG5vZGUuVmFsdWUpKSkgKyBcIi4gQmFzZSB3YXMgXCIgKyBiYXNlTm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIGJhc2VOb2RlLlZhbHVlLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYmxvY2tpbmdOb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gXHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJjdXJyZW50UGF0aFwiPjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiZmxvd1wiPjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zPk51bWJlciBvZiBub2RlcyB0aGF0IGJsb2NrIGN1cnJlbnQgcGF0aDwvcmV0dXJucz5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEdldEN1cnJlbnRGbG93KElFbnVtZXJhYmxlPE5vZGU+IGN1cnJlbnRQYXRoLCBGbG93IGZsb3csIHN0cmluZyBpbmZvKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGluZm8gPT0gXCJUaGlzVG9TdHJpbmdcIilcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnQuTWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICBpbnQgYmxvY2tpbmdOb2RlcyA9IC0xO1xyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gVGltZSBub2RlLCB0aGF0IEkgd2FudCB0byBnbyB0aHJvdWdoXHJcbiAgICAgICAgICAgICAgICBOb2RlIGJhc2VOb2RlID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0xpc3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KGN1cnJlbnRQYXRoKVtTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aCkgLSAxXTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkdldEN1cnJlbnRGbG93IFBhdGg6IFwiICsgU3RyaW5nLkpvaW48aW50PihcIixcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsaW50PihjdXJyZW50UGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgaW50Pikobm9kZSA9PiBub2RlLlZhbHVlKSkpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgYWxsVGltZU5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oZmxvdy5Ob2RlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSAhPSAtMSAmJiBub2RlICE9IGJhc2VOb2RlICYmIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsLCBcIkdldEN1cnJlbnRGbG93XCIpID09IDEpKS5Db3VudCgpID09IDEpKS5Ub0xpc3QoKTtcclxuU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5VbmlvbjxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oICAgICAgICAgICAgICAgIGFsbFRpbWVOb2RlcyxTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSAhPSAtMSAmJiBub2RlICE9IGJhc2VOb2RlKSkpO1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiU3RhcnRpbmcgQmxvY2tpbmdOb2Rlcy4uLlwiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICBibG9ja2luZ05vZGVzID0gR2V0QmxvY2tpbmdOb2RlcyhhbGxUaW1lTm9kZXMsIGJhc2VOb2RlKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkVuZGluZyBCbG9ja2luZ05vZGVzLi4uXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJCbG9ja2luZ05vZGVzIEZhaWxlZCEgSW5mbzogXCIgKyBpbmZvLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKGV4LCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJsb2NraW5nTm9kZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBTZXRDdXJyZW50RmxvdyhpbnQgbmV3VmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBEbyBub3RoaW5nXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdCn0K

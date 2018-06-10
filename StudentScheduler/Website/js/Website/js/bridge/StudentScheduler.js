Bridge.assembly("StudentScheduler", function ($asm, globals) {
    "use strict";

    Bridge.define("StudentScheduler.UnitTests.FlowsUnitTest", {
        statics: {
            ctors: {
                init: function () {
                    Bridge.ready(this.RunTests);
                }
            },
            methods: {
                RunTests: function () {
                    QUnit.module("TimeChunkTest");

                    QUnit.test("TimeChunk", function (assert) {
                        var timeFromTimeChunk = new StudentScheduler.AppLogic.NetworkFlow.Node("Time000", 0, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);
                        var timeToTimeChunk = new StudentScheduler.AppLogic.NetworkFlow.Node("Time010", 10, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);

                        //TimeChunk timeChunk = new TimeChunk()
                    });
                }
            }
        },
        $entryPoint: true
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJVbml0VGVzdHMvRmxvd3NVbml0VGVzdC5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O29CQWlCWUE7O29CQUVBQSx3QkFBd0JBLEFBQXFEQSxVQUFDQTt3QkFFMUVBLHdCQUF5QkEsSUFBSUEseURBQW1CQTt3QkFDaERBLHNCQUF1QkEsSUFBSUEsMERBQW9CQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5RVW5pdDtcclxudXNpbmcgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdztcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuVW5pdFRlc3RzXHJcbntcclxuICAgIFtGaWxlTmFtZShcIi4uL1dlYnNpdGUvanMvYnJpZGdlL1N0dWRlbnRTY2hlZHVsZXIuanNcIildXHJcbiAgICBjbGFzcyBGbG93c1VuaXRUZXN0XHJcbiAgICB7XHJcbiAgICAgICAgW1JlYWR5XVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBSdW5UZXN0cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBRVW5pdC5Nb2R1bGUoXCJUaW1lQ2h1bmtUZXN0XCIpO1xyXG5cclxuICAgICAgICAgICAgUVVuaXQuVGVzdChcIlRpbWVDaHVua1wiLCAoZ2xvYmFsOjpTeXN0ZW0uQWN0aW9uPGdsb2JhbDo6QnJpZGdlLlFVbml0LkFzc2VydD4pKChhc3NlcnQpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE5vZGUgdGltZUZyb21UaW1lQ2h1bmsgPSBuZXcgTm9kZShcIlRpbWUwMDBcIiwgMCwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgICAgIE5vZGUgdGltZVRvVGltZUNodW5rID0gbmV3IE5vZGUoXCJUaW1lMDEwXCIsIDEwLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vVGltZUNodW5rIHRpbWVDaHVuayA9IG5ldyBUaW1lQ2h1bmsoKVxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdCn0K

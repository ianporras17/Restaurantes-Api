
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [
    { _id: 0, host: "configsvr1:27021" },
    { _id: 1, host: "configsvr2:27021" },
    { _id: 2, host: "configsvr3:27021" }
  ]
});

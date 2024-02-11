export const calibrationToZone = () => {
  const calibrationData = [
    {
      zone: [790, 94, 824, 454, 180, 443, 157, 85],
      lanes: [
        [315.25, 87.25, 341, 445.75],
        [473.5, 89.5, 502, 448.5],
        [631.75, 91.75, 663, 451.25],
      ],
    },
  ];
  const array = calibrationData[0].zone;

  const midIndex = Math.floor(array.length / 2);

  const firstPart = array.splice(midIndex);

  const secondPart = array;

  const laneArray = structuredClone(calibrationData[0].lanes);
  const length = laneArray.length - 1;
  console.log("secnd", laneArray);

  console.log("firstPart", secondPart);

  let count = laneArray.length;
  let zonePolygon = [
    // {
    //   type: "zone",
    //   coordinates: [...laneArray[0], ...firstPart],
    //   marked: { vehiclecheck: true, bicyclecheck: false },
    // },
    // {
    //   type: "zone",
    //   coordinates: [...secondPart, ...laneArray[length]],
    //   marked: { vehiclecheck: true, bicyclecheck: false },
    // },
  ];
  const newArray = structuredClone(calibrationData[0].lanes);

  //   for (let i = 0; i < count - 1; i++) {
  //     if (newArray.length > 0) {
  //     }

  //     newArray.splice(-1);
  //   }
  for (let i = newArray.length - 2; i >= 0; i--) {
    if (newArray.length > 2) {
      const secondOrder = newArray[newArray.length - 2];
      // const array = calibrationData[0].zone;
      let finalOr = [];
      if (secondOrder.length > 3) {
        const midIndex = Math.floor(secondOrder.length / 2);
        const firstarr = secondOrder.splice(midIndex);
        const secondarr = secondOrder;
        finalOr = [...secondarr, ...firstarr];
      }
      const mergedArray = [...newArray[newArray.length - 1], 1, 0, 0, 0];
      console.log("finalOr", mergedArray, newArray);
      zonePolygon = [
        ...zonePolygon,
        {
          type: "zone",
          coordinates: mergedArray,
          marked: { vehiclecheck: true, bicyclecheck: false },
        },
      ];
      console.log("newArray", newArray);
      newArray.splice(i, 1);
    }
    console.log("elements", newArray);
  }
  //   zonePolygon = [...zonePolygon, ...polygonFromFull];
  return zonePolygon;
};
let coordinates1 = coordinates;
const CircleCor = () => {
  return (
    <Layer>
      {coordinates1.map((point, index) => {
        const { x, y } = point;
        return (
          <>
            <Circle
              id={"corner" + index}
              key={index + "corner"}
              x={x}
              y={y}
              radius={3}
              fill="red"
              opacity={1}
              stroke={"red"}
              strokeWidth={2}
            />
            <Text key={index} x={x} y={y} text={`(${x}, ${y})`} fontSize={10} />
          </>
        );
      })}
    </Layer>
  );
};
// .myfiles_container {
//   width: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 10px;
//   background-repeat: no-repeat;
//   background-size: cover;
//   height: 100%;

//   .myfiles_card {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     gap: 20px;
//     width: 100%;
//     height: 95%;
//     .video-popup {
//       .video-close {
//         background: red;
//       }
//     }
//     .myfiles_card_message {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;

//       gap: 12px;
//       margin-top: 4px;
//       width: 90%;
//       height: 100%;
//     }

//     .paginated_data {
//       display: flex;
//       gap: 12px;
//       margin-top: 4px;
//       width: 90%;
//       height: 100%;
//       .MuiDataGrid-overlayWrapperInner {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         height: 574px !important;
//       }

//       .MuiDataGrid-main {
//         width: 100%;
//       }
//       .MuiDataGrid-footerContainer {
//         width: 100%;
//       }
//       .css-axafay-MuiDataGrid-virtualScroller {
//         overflow-y: auto !important;
//       }
//     }
//   }
// }
// @media only screen and (max-width: 1680px) {
//   .paginated_data {
//     display: flex;
//     gap: 12px;
//     margin-top: 4px;
//     width: 98% !important;
//     height: 100%;
//   }
// }
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "./ZoneCalibration.scss";
import SupervisorSidebar from "../SupervisorSidebar/SupervisorSidebar";
import { zoneSetupSideMenus } from "../constants";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Group,
  Image,
  Arrow,
  Text,
} from "react-konva";
import VideoPlayer from "common-ui/CheckBox/VideoPlayer/VideoPlayer";
import { zoneColors } from "assets/style";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { cameraRes, response } from "../response";
import image1 from "../../../assets/Images/EasyBicycle.png";
import EasySetup from "./EasySetup/EasySetup";
import useImage from "use-image";
import axios from "axios";
import { addPolygons } from "store/undoRedo/action";
import { ActionCreators as UndoActionCreators } from "redux-undo";
import { getSupervisorVideo } from "store/supervisor/action";
import { useNavigate } from "react-router-dom";
import {
  CircleCor,
  calibrationToZone,
  cornerOverlapCheck,
} from "../helperUtils";

const ZoneCalibration = ({ setForward, selectedVideo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [polygons, setPolygons] = useState([]);
  const [loading, setLoading] = useState([]);
  const [selectedZone, setSelectedZone] = useState({});
  const [crossDis, setCrossDis] = useState(false);
  const [waitingDis, setWaitingDis] = useState(false);
  const [zoneDis, setZoneDis] = useState(true);
  const UndoRedoReducer = useSelector((state) => state.UndoRedoReducer);

  const userReducer = useSelector((state) => state?.AuthReducer);
  const supervisorReducer = useSelector((state) => state?.SupervisorReducer);

  const futurearray = UndoRedoReducer.future[0] ?? [];
  const handleRedo = async () => {
    const futureData =
      (await futurearray.length) > 0
        ? futurearray[futurearray.length - 1]?.payload ?? "[]"
        : "[]";
    setPolygons(JSON.parse(futureData));
    dispatch(UndoActionCreators.redo());
  };
  const pastLength = (UndoRedoReducer.past ?? []).length;
  const firstarray = UndoRedoReducer.past[pastLength - 1] ?? [];

  const handleUndo = async () => {
    const pastData =
      (await firstarray.length) > 0
        ? firstarray[firstarray.length - 1]?.payload ?? "[]"
        : "[]";
    await setPolygons(JSON.parse(pastData));
    dispatch(UndoActionCreators.undo());
  };
  useEffect(() => {
    dispatch(UndoActionCreators.clearHistory());
    const convertedZones = calibrationToZone(supervisorReducer?.calibrationRaw);
    setPolygons(convertedZones);
    dispatch(addPolygons(JSON.stringify(convertedZones)));
  }, []);
  const handleCornerClick = (polygonIndex, cornerIndex, newX, newY) => {
    const newPolygons = [...polygons];
    const updatedPolygon = newPolygons[polygonIndex];
    if (
      cornerOverlapCheck(
        updatedPolygon,
        polygonIndex,
        cornerIndex,
        newX,
        newY,
        setCornerDraggable
      )
    ) {
      updatedPolygon.coordinates[cornerIndex] = newX;
    }
    updatedPolygon.coordinates[cornerIndex + 1] = newY;
    newPolygons[polygonIndex] = updatedPolygon;
    setPolygons(newPolygons);
    // setCornerDraggable(true);
  };
  const [cornerDraggable, setCornerDraggable] = useState(true);
  const handleAddPolygon = async (type) => {
    const newPolygon = await generateRandomPolygon(type);

    const newPolygons = [...polygons, newPolygon];
    const newLoading = [...loading, [false, false, false, false]];
    setPolygons(newPolygons);
    dispatch(addPolygons(JSON.stringify(newPolygons || [])));

    setSelectedZone({ index: polygons.length });
    setZoneDis(false);
    setLoading(newLoading);
  };

  const handleStageClick = (e) => {
    setSelectedZone({ index: "" });
    setZoneDis(true);
  };
  const handleLayerMouseDownClick = async (obj) => {
    const data = await obj.target;
    const axis = await obj.target.absolutePosition();
    const newX = await data.x();
    const newY = await data.y();
    let newPolygons = [...polygons];
    let newPolygon = await newPolygons[data?.index].coordinates;
    newPolygon[0] = await (newX + newPolygon[0]);
    newPolygon[1] = await (newY + newPolygon[1]);
    newPolygon[2] = await (newX + newPolygon[2]);
    newPolygon[3] = await (newY + newPolygon[3]);
    newPolygon[4] = await (newX + newPolygon[4]);
    newPolygon[5] = await (newY + newPolygon[5]);
    newPolygon[6] = await (newX + newPolygon[6]);
    newPolygon[7] = await (newY + newPolygon[7]);
    setPolygons(newPolygons);
    dispatch(addPolygons(JSON.stringify(newPolygons || [])));
    await obj.target.setAbsolutePosition({
      x: 0,
      y: 0,
    });
    newPolygons = [];
  };

  const zoneconversion = (polygonArr) => {
    const zoneRes = polygonArr.map((obj, index) => {
      const arr = obj.coordinates;
      return {
        zoneType: "Polygon",
        id: 547668586,
        name: "Zone",
        corners: {
          points: [
            {
              x: arr[0],
              y: arr[1],
            },
            {
              x: arr[2],
              y: arr[3],
            },
            {
              x: arr[4],
              y: arr[5],
            },
            {
              x: arr[6],
              y: arr[7],
            },
          ],
        },
      };
    });
    return zoneRes;
  };

  const generateRandomPolygon = async (type) => {
    let newZone;
    const generateZone = {
      type: "zone",
      coordinates: [612, 179, 700, 501, 348, 536, 481, 181],
      marked: { vehiclecheck: true, bicyclecheck: false },
    };
    const generateCroWalk = {
      type: "crosswalk",
      coordinates: [340, 439, 818, 434, 823, 520, 334, 526],
      marked: { pedestrian: true },
    };
    const generateWaitingZone = {
      type: "waitingzone",
      coordinates: [470, 234, 601, 234, 607, 317, 473, 320],
      marked: { pedestrian: true },
    };

    if (type === "zone") {
      newZone = generateZone;
    } else if (type === "crosswalk") {
      newZone = generateCroWalk;
    } else if (type === "waitingzone") {
      newZone = generateWaitingZone;
    }
    // if (polygons?.length > 0) {
    //   const lastPolygon = polygons[polygons.length - 1];
    //   const generatePolygon = lastPolygon.map((poly, index) => {
    //     console.log("generatePolygon", poly, index + 1);
    //     if ((index + 1) % 2 !== 0) {
    //       const rem = poly / 3;
    //       return poly + rem;
    //     } else return poly;
    //   });
    //   return generatePolygon;
    // } else {
    //   return [612, 179, 700, 501, 348, 536, 481, 181];
    // }
    return newZone;
  };

  const debouncedMouseClick = debounce(handleLayerMouseDownClick, 100);
  const handleSetFill = (indexVal) => {
    setZoneDis(false);
    setSelectedZone({ index: indexVal });
  };
  const handleRemoveZone = () => {
    if (selectedZone?.index !== null) {
      const polygonIndex = selectedZone?.index;
      const newPolygons = [...polygons];
      const deleted = newPolygons.splice(polygonIndex, 1);
      setPolygons(newPolygons);
      setZoneDis(true);
      dispatch(addPolygons(JSON.stringify(polygons || [])));
      setSelectedZone({});
    }
  };
  const videoTimeStamp = selectedVideo?.zoneVideoLink?.split("/")[2];
  const handleSubmit = async () => {
    let postTime = new Date();
    let timeStamp = postTime.getTime();
    const defaultData = structuredClone(response);
    defaultData.sensors[0].zones = await zoneconversion(polygons);
    let scaleValues = {
      camJ: JSON.stringify(supervisorReducer?.calibrationOutput),
      zonej: JSON.stringify(defaultData),
      mail: userReducer?.user,
      time_stamp: videoTimeStamp,
      axis: "test",
      process_start_time: timeStamp.toString(),
    };
    setLoading(true);
    try {
      let response = await axios.post(
        process.env.REACT_APP_ZONE_SETUP_SAVE,
        scaleValues,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: userReducer?.token,
          },
        }
      );
      dispatch(UndoActionCreators.clearHistory());

      // alert(response?.data?.body);
      navigate("/admin/myfiles", { state: { status: "applied" } });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err, "post error");
    }
  };
  console.log("draggaaa", cornerDraggable);
  const [image] = useImage(image1);
  return (
    <Box className="zone-calibration-container">
      <SupervisorSidebar
        sideMenus={zoneSetupSideMenus(
          handleAddPolygon,
          setForward,
          handleRemoveZone,
          zoneDis,
          handleSubmit,
          crossDis,
          waitingDis,
          handleRedo,
          handleUndo,
          UndoRedoReducer
        )}
      />
      <Box className="zone-video-container">
        <Typography className="zone-setup-video-tit2" variant="h6">
          {selectedVideo?.videoName || ""}
        </Typography>
        <Box className="zone-setup-video">
          <Box>
            <VideoPlayer
              width={1280}
              height={750}
              selectedVideo={selectedVideo?.zoneVideoLink}
            />
            <Stage
              style={{
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 80%",
                position: "absolute",
                top: "16.5%",
                zIndex: +1,
              }}
              width={1280}
              height={720}
              onClick={handleStageClick}
            >
              <>
                <Layer>
                  {polygons.map((point, index) => {
                    const points = point.coordinates;
                    const verticalArrow = [
                      (points[0] + points[6]) / 2,
                      (points[1] + points[7]) / 2,
                      (points[2] + points[4]) / 2,
                      (points[3] + points[5]) / 2,
                    ];
                    const horizArrow = [
                      (points[0] + points[2]) / 2,
                      (points[1] + points[3]) / 2,
                      (points[4] + points[6]) / 2,
                      (points[5] + points[7]) / 2,
                    ];
                    const combinedArrow = [verticalArrow, horizArrow];
                    return (
                      <Group
                        key={index}
                        draggable={selectedZone?.index === index}
                        id={index + "group"}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          handleSetFill(index);
                        }}
                        onDragEnd={(e) => {
                          if (
                            e.target.nodeType === "Group" &&
                            e.type === "dragend"
                          ) {
                            e.evt.preventDefault();
                            debouncedMouseClick(e);
                          }
                        }}
                      >
                        <Line
                          id={index + "line"}
                          key={index}
                          points={points}
                          closed
                          stroke={
                            selectedZone?.index === index
                              ? "#00ff00"
                              : "#004d00"
                          }
                          strokeWidth={4}
                          opacity={0.8}
                          fill={
                            selectedZone?.index === index
                              ? "#007f00"
                              : "#006600"
                          }
                        />

                        {points.map((point, cornerIndex) => {
                          return cornerIndex % 2 === 0 ? (
                            <>
                              <Circle
                                id={"corner" + cornerIndex}
                                key={cornerIndex}
                                x={point}
                                y={points[cornerIndex + 1]}
                                radius={selectedZone?.index === index ? 10 : 0}
                                opacity={1}
                                style={{ background: "red" }}
                                stroke={"#07f505"}
                                strokeWidth={4}
                              />
                              <Circle
                                id={"corner" + cornerIndex}
                                key={cornerIndex}
                                x={point}
                                y={points[cornerIndex + 1]}
                                radius={selectedZone?.index === index ? 10 : 0}
                                opacity={0.1}
                                style={{ background: "red" }}
                                stroke={"#07f505"}
                                strokeWidth={4}
                                draggable={cornerDraggable}
                                onDragMove={(e) =>
                                  handleCornerClick(
                                    index,
                                    cornerIndex,
                                    e.target.x(),
                                    e.target.y()
                                  )
                                }
                                onMouseDown={(e) => {
                                  console.log("mousedragg");
                                }}
                                onDragEnd={() => {
                                  console.log("draggend");
                                  setCornerDraggable(true);
                                  dispatch(
                                    addPolygons(JSON.stringify(polygons || []))
                                  );
                                }}
                              />
                            </>
                          ) : null;
                        })}
                      </Group>
                    );
                  })}
                </Layer>
              </>
            </Stage>
          </Box>
        </Box>
      </Box>
      <EasySetup
        polygons={polygons}
        handleRemoveZone={handleRemoveZone}
        handleSetFill={handleSetFill}
        selectedZone={selectedZone}
        setPolygons={setPolygons}
      />
    </Box>
  );
};

export default ZoneCalibration;
import { Circle, Layer, Text } from "react-konva";
import { coordinates } from "./coordinates";
export const calibrationToZone = (data) => {
  console.log("datadatadata", data);
  const calibrationData = data ?? [];
  const zoneArray = structuredClone(calibrationData[0].zone);
  const laneArray = structuredClone(calibrationData[0].lanes);
  let firstLane = [];
  let lastLane = [];
  let firstZone = [];
  let lastZone = [];
  firstLane = structuredClone(laneArray[0]);

  if (laneArray.length > 1) {
    lastLane = arrShuffle(laneArray[laneArray.length - 1]);
  } else {
    lastLane = arrShuffle(laneArray[0]);
  }

  zoneArray.map((zone, index) => {
    if (index < 4) {
      firstZone = [...firstZone, zone];
    } else {
      lastZone = [...lastZone, zone];
    }
  });
  const laneToZoneConverted =
    laneArray.length > 1 ? LaneZoneConversion(calibrationData[0].lanes) : [];
  let zonePolygon = [
    {
      type: "zone",
      coordinates: [...firstLane, ...lastZone],
      marked: { vehiclecheck: true, bicyclecheck: false },
    },
    {
      type: "zone",
      coordinates: [...firstZone, ...lastLane],
      marked: { vehiclecheck: true, bicyclecheck: false },
    },
    ...laneToZoneConverted,
  ];
  return zonePolygon;
};
let coordinates1 = coordinates;
export const CircleCor = () => {
  return (
    <Layer>
      {coordinates1.map((point, index) => {
        const { x, y } = point;
        return (
          <>
            <Circle
              id={"corner" + index}
              key={index + "corner"}
              x={x}
              y={y}
              radius={3}
              fill="red"
              opacity={1}
              stroke={"red"}
              strokeWidth={2}
            />
            <Text key={index} x={x} y={y} text={`(${x}, ${y})`} fontSize={10} />
          </>
        );
      })}
    </Layer>
  );
};

const LaneZoneConversion = (lanes) => {
  let originalArray = structuredClone(lanes);
  let zoneData = [];
  for (
    let i = 0;
    i < originalArray.length >= 4
      ? originalArray.length + 4
      : originalArray.length;
    i++
  ) {
    let newArray = structuredClone(originalArray);
    let shuffled = [];
    shuffled = newArray[newArray.length - 2] ?? [];
    shuffled = arrShuffle(shuffled);
    const merged = [...newArray[newArray.length - 1], ...shuffled];
    zoneData = [...zoneData, merged];
    originalArray.pop();
  }
  const convertedZone = zoneData
    .filter((fil) => fil.length > 7)
    .map((zone) => {
      return {
        type: "zone",
        coordinates: zone,
        marked: { vehiclecheck: true, bicyclecheck: false },
      };
    });
  return convertedZone;
};

const arrShuffle = (arr) => {
  const midIndex = Math.floor(arr.length / 2);
  const firstarr = arr.splice(midIndex);
  const secondarr = arr;
  const finalOr = [...firstarr, ...secondarr];
  return finalOr;
};
export const cornerOverlapCheck = (
  updatedPolygon,
  polygonIndex,
  cornerIndex,
  newX,
  newY,
  setCornerDraggable
) => {
  if (cornerIndex === 0) {
    if (newX < updatedPolygon.coordinates[6] + 50) {
      setCornerDraggable(false);
      return false;
    } else {
      setCornerDraggable(true);
      return true;
    }
  }
};

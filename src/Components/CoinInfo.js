import axios from "axios";
import { useEffect, useState } from "react";
import { HistoricalChart } from "../config/api";
import { Line } from "react-chartjs-2";
import {
  CircularProgress,
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import SelectButton from "./SelectButton";
import { chartDays } from "../config/data";
import { CryptoState } from "../CryptoContext";
import { format } from "date-fns"; // Import the date-fns format function

import { Chart, LineController, LinearScale, PointElement, CategoryScale, LineElement } from "chart.js"; // Import required components and scales

// Register required components and scales with Chart.js
Chart.register(LineController, LinearScale, PointElement, CategoryScale, LineElement);

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState([]);
  const [days, setDays] = useState(1);
  const { currency } = CryptoState();
  const [flag, setFlag] = useState(false);
  const [lowerLimit, setLowerLimit] = useState(0);
  const [upperLimit, setUpperLimit] = useState(0);

  const useStyles = makeStyles((theme) => ({
    container: {
      width: "75%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 25,
      padding: 40,
      [theme.breakpoints.down("md")]: {
        width: "100%",
        marginTop: 0,
        padding: 20,
        paddingTop: 0,
      },
    },
  }));

  const classes = useStyles();

  const fetchHistoricData = async () => {
    try {
      const { data } = await axios.get(HistoricalChart(coin.id, days, currency));
      setFlag(true);
      setHistoricData(data.prices);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  console.log(coin);

  useEffect(() => {
    fetchHistoricData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  useEffect(() => {
    if (historicData.length > 0) {
      const latestPrice = historicData[historicData.length - 1][1];
      if (latestPrice < lowerLimit || latestPrice > upperLimit) {
        // Price crossed the defined limits, show the alert
        const message = `The price of ${coin.name} has crossed your defined limits. Current price: ${latestPrice} ${currency}. Do you want to proceed?`;
        const userResponse = window.prompt(message, "Yes");
        if (userResponse && userResponse.toLowerCase() === "yes") {
          // User clicked "Yes," you can handle the action here
          // For example, you can redirect the user to a specific page or perform any other action.
        } else {
          // User clicked "Cancel" or closed the prompt, you can handle the action here
          // For example, you can do nothing or show another message to the user.
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicData, lowerLimit, upperLimit]);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: "#fff",
      },
      type: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.container}>
        {!historicData || flag === false ? (
          <CircularProgress style={{ color: "gold" }} size={250} thickness={1} />
        ) : (
          <>
            <Line
              data={{
                labels: historicData.map((coin) => {
                  let date = new Date(coin[0]);
                  let time =
                    date.getHours() > 12
                      ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                      : `${date.getHours()}:${date.getMinutes()} AM`;
                  return days === 1 ? time : date.toLocaleDateString();
                }),
                datasets: [
                  {
                    data: historicData.map((coin) => coin[1]),
                    label: `Price ( Past ${days} Days ) in ${currency}`,
                    borderColor: "#EEBC1D",
                  },
                ],
              }}
              options={{
                elements: {
                  point: {
                    radius: 1,
                  },
                },
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 20,
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              {chartDays.map((day) => (
                <SelectButton
                  key={day.value}
                  onClick={() => {
                    setDays(day.value);
                    setFlag(false);
                  }}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <label htmlFor="lowerLimit" style={{ marginRight: 10 }}>Lower Limit: </label>
              <input
                type="number"
                id="lowerLimit"
                value={lowerLimit}
                onChange={(e) => setLowerLimit(Number(e.target.value))}
              />
              <label htmlFor="upperLimit" style={{ marginLeft: 10 }}>Upper Limit: </label>
              <input
                type="number"
                id="upperLimit"
                value={upperLimit}
                onChange={(e) => setUpperLimit(Number(e.target.value))}
              />
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CoinInfo;

import './App.css';
import Heatmap from './Heapmap';
import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';


function Loading() {
  return (
    <div>Loading...</div>
  )
}

function App() {
  const [nameFilter, setNameFilter] = React.useState("");
  const [originalData, setOriginalData] = React.useState(null);
  const [categoryLabels, setCategoryLabels] = React.useState(null);
  const [filteredCategoryResults, setFilteredCategoryResults] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const url = process.env.REACT_APP_API_URL || "https://ocds-summary-backend.vulekamali.gov.za/api/summary/latest";

  const applyFilters = () => {
    if (originalData == null)
      return;
    if (categoryLabels == null)
      return;
    let filteredMonths = originalData;
    if (nameFilter)
      filteredMonths = originalData.filter(item => item.buyer_name.includes(nameFilter))
    const groupedObj = filteredMonths.reduce((accumulator, value) => {
      if (accumulator[value.category] === undefined)
        accumulator[value.category] = [];
      accumulator[value.category].push(value);
      return accumulator;
    }, {});

    const groupedArr = categoryLabels.map(label => {
      return {
        "label": label,
        "items": groupedObj[label],
      }
    });
    setFilteredCategoryResults(groupedArr);
  };

  const loadData = () => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setLastUpdated(data.last_fetched);
        setOriginalData(data.months);
        setCategoryLabels(data.groups);
        applyFilters();
      })
      .catch((error) => {
        console.log(error)
        alert(error)
      });
  };

  useEffect(loadData, [url]);

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ bgcolor: "white", color: "black", boxShadow: "unset" }}>
          <Typography component="h1" sx={{ flexGrow: 1, padding: "12px", fontSize: "18px", "fontWeight": "800" }}>
            OCPO Open Contracting data
          </Typography>
        </AppBar>
      </Box>
      <div className="description" style={{ "padding": "0px 12px 0px 12px" }}>
        <p>This shows the number of procurement processes initiated by each organ of state each month according to the <a
          href="https://data.etenders.gov.za/">OCPO Open Contracting Data Standard API</a></p>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography sx={{ fontSize: "12px" }}>How to interpret this</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography component="div" sx={{ fontSize: "12px" }}>
              <p>Blocks can be blank either because no procurement took place in that period, or because data has not been uploaded for that period yet.</p>
              <p>Data is only available if an organ of state uploaded the data to the eTender portal. Data queries should be directed first to the respective organ of state, before reaching out to the OCPO.</p>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <p>Last updated: {lastUpdated == null ? "loading..." : lastUpdated.slice(0, 16)}</p>
      </div>

      <div className="filterContainer">
        <Typography>Filter items:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <SearchIcon sx={{ color: 'rgba(0,0,0,0.63)' }} />
          <TextField
            value={nameFilter}
            label=""
            variant="standard"
            placeholder="Filter by entity name"
            onChange={(event) => {
              setNameFilter(event.target.value);
              applyFilters();
            }} />
        </Box>
      </div>
      {filteredCategoryResults == null ? <Loading /> : (
        <>
          {filteredCategoryResults.map((category, i) =>
            <Section key={category.label} heading={category.label} data={category.items} />
          )}
        </>
      )}
    </div >
  );
}

function Section({ heading, data }) {
  return <Heatmap title={heading} data={data} rowKey="buyer_name" colKey="tender_year_month" valKey="total_count" />
}

export default App;

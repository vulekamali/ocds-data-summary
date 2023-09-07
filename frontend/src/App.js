import './App.css';
import Heatmap from './Heapmap';
import React, { useEffect } from 'react';

function Loading() {
  return (
    <div>Loading...</div>
  )
}

function App() {
  const [categoryResults, setCategoryResults] = React.useState(null);

  useEffect(() => {
    const url = "https://ocds-summary-backend.vulekamali.gov.za/api/summary/latest";
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const categoryLabels = data.groups;
        const groupedObj = data.months.reduce((accumulator, value) => {
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
        })
        setCategoryResults(groupedArr);
      })
      .catch((error) => {
        console.log(error)
        alert(error)
      });
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>OCPO Open Contracting data availability</h1>
        <p>This shows the number of procurement processes available for each organ of state by month at <a
          href="https://data.etenders.gov.za/">https://data.etenders.gov.za/</a></p>
        <p>Data is only available if an organ of state uploaded the data to the eTender portal. Data queries
          should be directed first to the respective organ of state, before reaching out to the OCPO.</p>
        <p>Last updated 2023-03-25 13:14:19</p>
        {categoryResults == null ? <Loading /> : (
          <>
            {categoryResults.map((category, i) =>
              <Section key={category.label} heading={category.label} data={category.items} marginTop={i > 0 && 200}/>
            )}
          </>
        )}
      </header>
    </div >
  );
}

function Section({ heading, data, marginTop }) {
  return <>
    <h2
      style={{ marginTop: marginTop }}
    >{heading}</h2>
    <Heatmap data={data} rowKey="buyer_name" colKey="tender_year_month" valKey="total_count" />
  </>
}

export default App;

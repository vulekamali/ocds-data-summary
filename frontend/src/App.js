import './App.css';
import monthCounts from './month_counts.json';
import Heatmap from './Heapmap';
import React from 'react';

function App() {
  const [loading, setLoading] = React.useState(true);

  const municipal = monthCounts.filter((x) => x.group === "municipality");
  const nationalDepartment = monthCounts.filter((x) => x.group === "national_department");
  const provincialDepartment = monthCounts.filter((x) => x.group === "provincial_department");
  const other = monthCounts.filter((x) => x.group === "other");

  return (
      <div className="App">
        <header className="App-header">
          <h1>OCPO Open Contracting data availability</h1>
          <p>This shows the number of procurement processes available for each organ of state by month at <a
              href="https://data.etenders.gov.za/">https://data.etenders.gov.za/</a></p>
          <p>Data is only available if an organ of state uploaded the data to the eTender portal. Data queries
            should be directed first to the respective organ of state, before reaching out to the OCPO.</p>
          <p>Last updated 2023-03-25 13:14:19</p>
          <Section heading="National departments" data={nationalDepartment}/>
          <Section heading="Provincial departments" data={provincialDepartment} marginTop={200}/>
          <Section heading="Municipalities" data={municipal} marginTop={200}/>
          <Section heading="Other buyers" data={other} marginTop={200}/>
        </header>
      </div>
  );
}

function Section({heading, data, marginTop}) {
  return <>
    <h2
        style={{marginTop: marginTop}}
    >{heading}</h2>
    <Heatmap data={data} rowKey="buyer_name" colKey="tender_year_month" valKey="count"/>
  </>
}

export default App;

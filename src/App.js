import React from 'react';
import CollegeTable from './data/CollegeTable';

const App = () => {
  return (
    <div>
      <header>
        <h1>College Comparison</h1>
      </header>
      <main>
        <CollegeTable />
      </main>
      <footer>
        <p>&copy; 2023 College Comparison. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
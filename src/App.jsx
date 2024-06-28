import { useEffect } from 'react';
import Uploader from './components/Uploader';

function Change() {
  useEffect(() => {
    document.title = 'Vault';
  }, []);
}


function App() {
  Change();
  return (
    <div className="App">
     <Uploader/>
    </div>
  );
}

export default App;

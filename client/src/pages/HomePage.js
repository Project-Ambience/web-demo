import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [clinicianTypes, setClinicianTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClinicianTypes = async () => {
      try {
        const response = await fetch('http://localhost:5090/api/clinician_types');
        const data = await response.json();
        setClinicianTypes(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClinicianTypes();
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {clinicianTypes.map(type => (
        <section key={type.id}>
          <h2>{type.name}</h2>
          <ul>
            {type.ai_models.map(model => (
              <li key={model.id}>
                <Link to={`/ai-models/${model.id}`} className="model-link">
                  {model.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default HomePage;
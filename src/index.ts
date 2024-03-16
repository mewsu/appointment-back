import express, { Express } from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
const { Pool } = require('pg');
import { IResolvers } from '@graphql-tools/utils'; 
require('dotenv').config();
// Define your schema
const typeDefs = gql`
  type Appointment {
    id: ID
    patientName: String!
    patientEmail: String!
    appointmentDate: String!
    purpose: String
  }

  type Mutation {
    createAppointment(patientName: String!, patientEmail: String!, appointmentDate: String!, purpose: String): Appointment
  }

  type Query {
    hello: String,
    getAllAppointments: [Appointment]
  }
`;

// Initialize PostgreSQL pool connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Define TypeScript interfaces for your resolver arguments
interface CreateAppointmentArgs {
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  purpose: string;
}

const resolvers: IResolvers = {
  // Test query Hello World
  Query: {
    hello: () => 'Hello world!',
    getAllAppointments: async () => {
      const { rows } = await pool.query('SELECT * FROM appointments');
      return rows.map((row: { id: any; patient_name: any; patient_email: any; appointment_date: any; purpose: any; }) => ({
        id: row.id, // Adjust according to your column names
        patientName: row.patient_name,
        patientEmail: row.patient_email,
        appointmentDate: row.appointment_date,
        purpose: row.purpose,
      }));
    },
  },
  Mutation: {
    createAppointment: async (_, { patientName, patientEmail, appointmentDate, purpose }) => {
      const insertQuery = `
        INSERT INTO appointments (patient_name, patient_email, appointment_date, purpose) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id AS id, patient_name AS "patientName", patient_email AS "patientEmail", appointment_date AS "appointmentDate", purpose;
      `;
      try {
        const result = await pool.query(insertQuery, [patientName, patientEmail, appointmentDate, purpose]);
        return result.rows[0];
      } catch (error) {
        // Log the error and handle it as necessary
        console.error('Error creating appointment:', error);
        throw new Error('Failed to create appointment');
      }
    },
  },
};

const app: Express = express();
const server: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const HOST = process.env.APP_HOST || '0.0.0.0'; // Default to '0.0.0.0' if not specified
const PORT = parseInt(process.env.APP_PORT || '4000') || 4000;

// 'server.start' initializes the Apollo server
server.start().then(() => {
  // 'applyMiddleware' connects ApolloServer to a specific HTTP framework, express in this case
  server.applyMiddleware({ app: app as any });

  // Start the Express server
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}/graphql`);
  });
});
const mysql=require('mysql2/promise');
const fs=require('fs');
const path=require('path');
require('dotenv').config();

async function initDB(){
    let connection;
    try{
        connection=await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD   
        });
        console.log('Connected to MySQL server');
        
        const sqlFile=path.join(__dirname,'../scripts/init-database.sql');
        const sqlContent=fs.readFileSync(sqlFile,'utf8');
         
        const statements=sqlContent
        .split(';')
        .map(stmt=>stmt.trim()).filter(stmt=>stmt.length>0);

        for(const statement of statements){
            try{
                await connection.execute(statement);
                console.log('Executed statement:', statement.substring(0,50)+'...');
    
           }  catch(error){
                console.error('Error executing statement:',error.message);
           }
        }
        console.log('Database initialization completed successfully');
        await connection.end();
    } catch(error){
        console.error('Database initialization failed:',error.message);
        if(connection){
            await connection.end();
        }
        process.exit(1);
    }
}
initDB();
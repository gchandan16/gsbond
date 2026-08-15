
import { Sequelize } from 'sequelize'
import pg from 'pg'

export const connectTodb=async()=>{

        if(!global.sequelizeInstance)
        {
            try {

                const connection=new Sequelize(process.env.DATABASE_URL,{

                    dialect:'postgres',
                    logging:false,
                    dialectModule:pg
                });
    
                if(process.env.NODE_ENV==='production')
                {
                    global.sequelizeInstance=connection;
                }
    
                console.log("database connected successfully");
                return connection;
                
            } catch (error) {
                
                console.log("database not connected",error);
                return null;
            }
            
        }
        else{

            const connection=global.sequelizeInstance;
            return connection;

        }
        
     
}






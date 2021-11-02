const express = require("express");
const {v4: uuidv4} = require("uuid");


const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next){
  const {cpf} = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer){
    return response.status(400).json({error: "Customer not found"});
  }
  request.customer = customer;

  return next();
}


app.post("/account", (request, response)=>{
  const {cpf, name} = request.body;

  const customerAlreadyExists = customers.some(

    //função some usada para percorrer o array
    (customer)=> customer.cpf === cpf

  );

  if(customerAlreadyExists){
    return response.status(400).json({ error: "Customer already exists!"});
  }


  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  

  return response.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response)=>{

  const {customer} = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF , (request, response)=>{
  const {description, amount} = request.body;

  const {customer} = request;

  const statementOperation = {
    description,
    amount,
    create_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation); //O metodo push, atualiza o customer criado anteriormente

  return response.status(201).send();
});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response)=>{
  const {customer} = request;
  const {date} = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement)=> 
    statement.create_at.toDateString() === new Date (dateFormat).toDateString());

  return response.json(statement);
});

app.listen(3333);


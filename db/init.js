db = db.getSiblingDB("mint-db");
db.createCollection("users");
db.createCollection("messages");
db.createCollection("conversations");

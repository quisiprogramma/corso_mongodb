use company_demo;

// =====================================================
// RESET DATABASE
// =====================================================
db.dropDatabase();

// =====================================================
// HELPERS
// =====================================================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  const n = Math.random() * (max - min) + min;
  return Number(n.toFixed(decimals));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function pickMany(arr, min = 1, max = 3) {
  const count = randInt(min, max);
  const copy = [...arr];
  const out = [];
  while (out.length < count && copy.length > 0) {
    const idx = randInt(0, copy.length - 1);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function chance(pct) {
  return Math.random() * 100 < pct;
}

// =====================================================
// MASTER DATA ARRAYS
// =====================================================
const italianCities = [
  ["Verona", "VR", "37121"],
  ["Milano", "MI", "20121"],
  ["Brescia", "BS", "25121"],
  ["Padova", "PD", "35121"],
  ["Vicenza", "VI", "36100"],
  ["Bergamo", "BG", "24121"],
  ["Treviso", "TV", "31100"],
  ["Parma", "PR", "43121"],
  ["Modena", "MO", "41121"],
  ["Bologna", "BO", "40121"],
  ["Torino", "TO", "10121"],
  ["Genova", "GE", "16121"]
];

const names = [
  "Marco","Luca","Giulia","Anna","Laura","Matteo","Paolo","Sara",
  "Elena","Francesco","Davide","Chiara","Federico","Marta","Andrea",
  "Valentina","Alessandro","Stefano","Silvia","Giorgia"
];

const surnames = [
  "Rossi","Bianchi","Verdi","Neri","Conti","Esposito","Romano",
  "Gallo","Costa","Fontana","Greco","Moretti","Marini","Longo",
  "Ferrari","Ricci","Lombardi","Barbieri","De Luca","Mancini"
];

const clientTypes = ["BUSINESS", "PRIVATE"];
const clientStatuses = ["ACTIVE", "ACTIVE", "ACTIVE", "SUSPENDED", "PROSPECT"];
const clientCategories = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

const supplierCountries = ["IT", "DE", "FR", "ES", "NL", "PL"];
const productCategories = [
  "LAPTOPS", "MONITORS", "ACCESSORIES", "NETWORKING", "STORAGE",
  "PRINTERS", "OFFICE", "AUDIO", "SMART_HOME", "CABLES"
];
const brands = [
  "TechNova", "BlueChip", "VisionX", "CoreWave", "DataPulse",
  "PixelWare", "WorkLine", "NetAxis", "Optima", "SmartEdge"
];

const clientTags = [
  "nord", "sud", "retail", "b2b", "strategic", "online",
  "vip", "new", "delayed-payments", "wholesale"
];

const supplierCertifications = ["ISO9001", "ISO14001", "ISO27001", "CE", "RoHS"];
const channels = ["ONLINE", "DIRECT", "RESELLER", "MARKETPLACE"];
const salesOrderStatuses = ["DRAFT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const purchaseOrderStatuses = ["OPEN", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];
const paymentStatuses = ["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"];
const departments = ["SALES", "PURCHASING", "LOGISTICS", "ADMIN", "IT"];
const roles = ["SALES_REP", "BUYER", "WAREHOUSE_MANAGER", "ACCOUNTANT", "ANALYST"];
const movementTypes = ["IN", "OUT", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT"];

// =====================================================
// CREATE COLLECTIONS WITH BASIC VALIDATION
// =====================================================
db.createCollection("clients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["code", "companyName", "type", "status", "creditLimit", "paymentTermsDays", "createdAt"],
      properties: {
        code: { bsonType: "string" },
        companyName: { bsonType: "string" },
        type: { enum: ["BUSINESS", "PRIVATE"] },
        status: { enum: ["ACTIVE", "SUSPENDED", "PROSPECT"] },
        creditLimit: { bsonType: ["int", "long", "double", "decimal"] },
        paymentTermsDays: { bsonType: ["int", "long"] },
        addresses: { bsonType: "array" },
        contacts: { bsonType: "array" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("suppliers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["code", "companyName", "country", "rating", "leadTimeDays", "active"],
      properties: {
        code: { bsonType: "string" },
        companyName: { bsonType: "string" },
        country: { bsonType: "string" },
        rating: { bsonType: ["int", "long"] },
        leadTimeDays: { bsonType: ["int", "long"] },
        active: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["employeeCode", "firstName", "lastName", "department", "role", "hireDate", "active"],
      properties: {
        employeeCode: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        department: { bsonType: "string" },
        role: { bsonType: "string" },
        hireDate: { bsonType: "date" },
        active: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("warehouses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["code", "name", "address", "capacity", "isActive"],
      properties: {
        code: { bsonType: "string" },
        name: { bsonType: "string" },
        address: { bsonType: "object" },
        capacity: { bsonType: ["int", "long"] },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "name", "category", "brand", "supplierId", "unitPrice", "costPrice", "status"],
      properties: {
        sku: { bsonType: "string" },
        name: { bsonType: "string" },
        category: { bsonType: "string" },
        brand: { bsonType: "string" },
        supplierId: { bsonType: "objectId" },
        unitPrice: { bsonType: ["int", "long", "double", "decimal"] },
        costPrice: { bsonType: ["int", "long", "double", "decimal"] },
        status: { bsonType: "string" },
        tags: { bsonType: "array" },
        attributes: { bsonType: "object" }
      }
    }
  }
});

db.createCollection("salesOrders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderNumber", "clientId", "salesRepId", "orderDate", "status", "items", "totals"],
      properties: {
        orderNumber: { bsonType: "string" },
        clientId: { bsonType: "objectId" },
        salesRepId: { bsonType: "objectId" },
        orderDate: { bsonType: "date" },
        status: { bsonType: "string" },
        items: { bsonType: "array" },
        totals: { bsonType: "object" }
      }
    }
  }
});

db.createCollection("purchaseOrders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderNumber", "supplierId", "buyerEmployeeId", "orderDate", "status", "items", "totals"],
      properties: {
        orderNumber: { bsonType: "string" },
        supplierId: { bsonType: "objectId" },
        buyerEmployeeId: { bsonType: "objectId" },
        orderDate: { bsonType: "date" },
        status: { bsonType: "string" },
        items: { bsonType: "array" },
        totals: { bsonType: "object" }
      }
    }
  }
});

db.createCollection("inventoryMovements", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["movementDate", "productId", "warehouseId", "movementType", "quantity", "referenceType"],
      properties: {
        movementDate: { bsonType: "date" },
        productId: { bsonType: "objectId" },
        warehouseId: { bsonType: "objectId" },
        movementType: { bsonType: "string" },
        quantity: { bsonType: ["int", "long", "double", "decimal"] },
        referenceType: { bsonType: "string" }
      }
    }
  }
});

// =====================================================
// INDEXES
// =====================================================
db.clients.createIndex({ code: 1 }, { unique: true });
db.clients.createIndex({ companyName: 1 });
db.clients.createIndex({ status: 1, category: 1 });
db.clients.createIndex({ "addresses.city": 1 });
db.clients.createIndex({ tags: 1 });

db.suppliers.createIndex({ code: 1 }, { unique: true });
db.suppliers.createIndex({ companyName: 1 });
db.suppliers.createIndex({ country: 1, active: 1 });
db.suppliers.createIndex({ categoriesSupplied: 1 });

db.employees.createIndex({ employeeCode: 1 }, { unique: true });
db.employees.createIndex({ department: 1, role: 1 });

db.warehouses.createIndex({ code: 1 }, { unique: true });
db.warehouses.createIndex({ "address.city": 1 });

db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1, brand: 1 });
db.products.createIndex({ supplierId: 1 });
db.products.createIndex({ unitPrice: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ tags: 1 });

db.salesOrders.createIndex({ orderNumber: 1 }, { unique: true });
db.salesOrders.createIndex({ clientId: 1, orderDate: -1 });
db.salesOrders.createIndex({ salesRepId: 1, orderDate: -1 });
db.salesOrders.createIndex({ status: 1, paymentStatus: 1 });
db.salesOrders.createIndex({ "items.productId": 1 });

db.purchaseOrders.createIndex({ orderNumber: 1 }, { unique: true });
db.purchaseOrders.createIndex({ supplierId: 1, orderDate: -1 });
db.purchaseOrders.createIndex({ buyerEmployeeId: 1, orderDate: -1 });
db.purchaseOrders.createIndex({ status: 1 });
db.purchaseOrders.createIndex({ "items.productId": 1 });

db.inventoryMovements.createIndex({ productId: 1, movementDate: 1 });
db.inventoryMovements.createIndex({ warehouseId: 1, movementDate: 1 });
db.inventoryMovements.createIndex({ movementType: 1 });
db.inventoryMovements.createIndex({ referenceType: 1, referenceId: 1 });

// =====================================================
// EMPLOYEES
// =====================================================
const employees = [];
for (let i = 1; i <= 24; i++) {
  const department = pick(departments);
  let role = "ANALYST";
  if (department === "SALES") role = "SALES_REP";
  else if (department === "PURCHASING") role = "BUYER";
  else if (department === "LOGISTICS") role = "WAREHOUSE_MANAGER";
  else if (department === "ADMIN") role = "ACCOUNTANT";

  employees.push({
    _id: new ObjectId(),
    employeeCode: "EMP" + pad(i, 4),
    firstName: pick(names),
    lastName: pick(surnames),
    department,
    role,
    email: `emp${pad(i,4)}@companydemo.local`,
    hireDate: randomDate(new Date("2019-01-01"), new Date("2025-01-31")),
    salary: randInt(24000, 62000),
    active: chance(92),
    skills: pickMany(
      ["mongo", "sales", "negotiation", "excel", "forecasting", "logistics", "reporting", "purchasing", "support"],
      2,
      5
    )
  });
}
db.employees.insertMany(employees);

const salesReps = db.employees.find({ role: "SALES_REP", active: true }).toArray();
const buyers = db.employees.find({ role: "BUYER", active: true }).toArray();
const warehouseManagers = db.employees.find({ role: "WAREHOUSE_MANAGER" }).toArray();

// =====================================================
// WAREHOUSES
// =====================================================
const warehouseDocs = [
  {
    _id: new ObjectId(),
    code: "WH-NORD",
    name: "Magazzino Nord",
    address: {
      street: "Via del Lavoro 18",
      city: "Verona",
      province: "VR",
      postalCode: "37135",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[0]?._id || employees[0]._id,
    capacity: 12000,
    isActive: true
  },
  {
    _id: new ObjectId(),
    code: "WH-OVEST",
    name: "Magazzino Ovest",
    address: {
      street: "Via Industria 7",
      city: "Milano",
      province: "MI",
      postalCode: "20121",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[1]?._id || employees[1]._id,
    capacity: 9500,
    isActive: true
  },
  {
    _id: new ObjectId(),
    code: "WH-EST",
    name: "Magazzino Est",
    address: {
      street: "Via Europa 44",
      city: "Padova",
      province: "PD",
      postalCode: "35121",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[2]?._id || employees[2]._id,
    capacity: 8800,
    isActive: true
  },
  {
    _id: new ObjectId(),
    code: "WH-CENTRO",
    name: "Magazzino Centro",
    address: {
      street: "Via Emilia 130",
      city: "Bologna",
      province: "BO",
      postalCode: "40121",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[3]?._id || employees[3]._id,
    capacity: 10000,
    isActive: true
  },
  {
    _id: new ObjectId(),
    code: "WH-SUD",
    name: "Magazzino Sud",
    address: {
      street: "Via Mercurio 2",
      city: "Parma",
      province: "PR",
      postalCode: "43121",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[4]?._id || employees[4]._id,
    capacity: 7600,
    isActive: true
  },
  {
    _id: new ObjectId(),
    code: "WH-RETURNS",
    name: "Magazzino Resi",
    address: {
      street: "Via Recupero 5",
      city: "Brescia",
      province: "BS",
      postalCode: "25121",
      country: "IT"
    },
    managerEmployeeId: warehouseManagers[5]?._id || employees[5]._id,
    capacity: 3200,
    isActive: true
  }
];
db.warehouses.insertMany(warehouseDocs);

// =====================================================
// SUPPLIERS
// =====================================================
const suppliers = [];
for (let i = 1; i <= 60; i++) {
  const country = pick(supplierCountries);
  suppliers.push({
    _id: new ObjectId(),
    code: "SUP" + pad(i, 4),
    companyName: `${pick(["Global", "Prime", "Future", "Delta", "North", "Euro", "Smart", "Blue"])} ${pick(["Components", "Supply", "Trade", "Distribution", "Electronics", "Solutions"])} ${pick(["SpA", "SRL", "GmbH", "SA", "BV"])}`,
    vatNumber: String(randInt(10000000000, 99999999999)),
    country,
    rating: randInt(2, 5),
    leadTimeDays: randInt(3, 30),
    paymentTermsDays: pick([30, 45, 60, 90]),
    categoriesSupplied: pickMany(productCategories, 1, 4),
    contacts: [
      {
        name: `${pick(names)} ${pick(surnames)}`,
        role: "Sales Rep",
        email: `contact${i}@supplierdemo.local`,
        phone: `+39-02-${randInt(100000, 999999)}`
      }
    ],
    certifications: pickMany(supplierCertifications, 1, 3),
    active: chance(90),
    createdAt: randomDate(new Date("2022-01-01"), new Date("2024-12-31"))
  });
}
db.suppliers.insertMany(suppliers);

// =====================================================
// CLIENTS
// =====================================================
const clients = [];
for (let i = 1; i <= 220; i++) {
  const cityInfo = pick(italianCities);
  const shippingCityInfo = chance(70) ? pick(italianCities) : cityInfo;

  const type = pick(clientTypes);
  const status = pick(clientStatuses);

  const companyName =
    type === "BUSINESS"
      ? `${pick(["Alfa", "Beta", "Gamma", "Delta", "Orion", "Nova", "Linea", "Sigma", "Aurora", "Zenith"])} ${pick(["Retail", "Office", "Digital", "Distribution", "Store", "Trade", "Business", "Market"])} ${pick(["SRL", "SpA", "SNC"])}`
      : `${pick(names)} ${pick(surnames)}`;

  clients.push({
    _id: new ObjectId(),
    code: "CLI" + pad(i, 4),
    companyName,
    vatNumber: type === "BUSINESS" ? "IT" + randInt(10000000000, 99999999999) : null,
    fiscalCode: String(randInt(10000000000, 99999999999)),
    type,
    status,
    email: `client${pad(i,4)}@clientdemo.local`,
    phone: `+39-045-${randInt(100000, 999999)}`,
    category: pick(clientCategories),
    creditLimit: randInt(1000, 80000),
    paymentTermsDays: pick([0, 15, 30, 45, 60]),
    addresses: [
      {
        type: "LEGAL",
        street: `Via ${pick(["Roma", "Milano", "Garibaldi", "Mazzini", "Europa", "Verdi"])} ${randInt(1, 120)}`,
        city: cityInfo[0],
        province: cityInfo[1],
        postalCode: cityInfo[2],
        country: "IT"
      },
      {
        type: "SHIPPING",
        street: `Via ${pick(["Industria", "Lavoro", "Commercio", "Mercato", "Artigianato"])} ${randInt(1, 120)}`,
        city: shippingCityInfo[0],
        province: shippingCityInfo[1],
        postalCode: shippingCityInfo[2],
        country: "IT"
      }
    ],
    contacts: [
      {
        name: `${pick(names)} ${pick(surnames)}`,
        role: pick(["Buyer", "Owner", "Admin", "Logistics"]),
        email: `contact${i}@clientdemo.local`,
        phone: `+39-045-${randInt(100000, 999999)}`
      },
      {
        name: `${pick(names)} ${pick(surnames)}`,
        role: pick(["Assistant", "Finance", "Warehouse"]),
        email: `secondary${i}@clientdemo.local`,
        phone: `+39-045-${randInt(100000, 999999)}`
      }
    ],
    tags: pickMany(clientTags, 2, 4),
    createdAt: randomDate(new Date("2023-01-01"), new Date("2025-01-31")),
    updatedAt: randomDate(new Date("2025-01-01"), new Date("2025-12-31"))
  });
}
db.clients.insertMany(clients);

// =====================================================
// PRODUCTS
// =====================================================
const allSuppliers = db.suppliers.find({ active: true }).toArray();
const allWarehouses = db.warehouses.find().toArray();

const products = [];
for (let i = 1; i <= 320; i++) {
  const category = pick(productCategories);
  const supplier = pick(allSuppliers);
  const warehouse = pick(allWarehouses);
  const cost = randFloat(3, 700, 2);
  const marginFactor = randFloat(1.18, 1.85, 2);
  const unitPrice = Number((cost * marginFactor).toFixed(2));

  products.push({
    _id: new ObjectId(),
    sku: "SKU-" + pad(i, 6),
    name: `${pick(brands)} ${pick(["Basic", "Plus", "Pro", "Mini", "Max", "Air", "Desk", "Hub", "Station"])} ${pick(["Mouse", "Keyboard", "Monitor", "Speaker", "Dock", "Router", "SSD", "Cable", "Printer", "Webcam"])}`,
    description: `Prodotto categoria ${category}`,
    category,
    brand: pick(brands),
    supplierId: supplier._id,
    unitPrice,
    costPrice: cost,
    vatRate: pick([4, 10, 22]),
    status: chance(92) ? "ACTIVE" : "DISCONTINUED",
    tags: pickMany(["wireless", "office", "gaming", "premium", "eco", "compact", "bestseller", "entry-level"], 1, 4),
    attributes: {
      color: pick(["black", "white", "silver", "blue", "red"]),
      weightKg: randFloat(0.05, 12.5, 2),
      dimensionsCm: {
        width: randFloat(5, 60, 1),
        height: randFloat(2, 40, 1),
        depth: randFloat(5, 50, 1)
      },
      warrantyMonths: pick([12, 24, 36]),
      fragile: chance(20)
    },
    reorderLevel: randInt(10, 120),
    preferredWarehouseId: warehouse._id,
    createdAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
    updatedAt: randomDate(new Date("2025-01-01"), new Date("2025-12-31"))
  });
}
db.products.insertMany(products);

// =====================================================
// PURCHASE ORDERS
// =====================================================
const allProducts = db.products.find().toArray();
const purchaseOrders = [];
const purchaseOrderIds = [];

for (let i = 1; i <= 180; i++) {
  const supplier = pick(allSuppliers);
  const buyer = buyers.length ? pick(buyers) : pick(employees);
  const orderDate = randomDate(new Date("2024-01-01"), new Date("2025-12-31"));
  const linesCount = randInt(2, 6);

  const supplierProducts = allProducts.filter(p => p.supplierId.valueOf() === supplier._id.valueOf());
  const sourceProducts = supplierProducts.length ? supplierProducts : allProducts;

  const chosen = pickMany(sourceProducts, linesCount, linesCount);
  let netAmount = 0;

  const items = chosen.map((p, idx) => {
    const quantity = randInt(10, 150);
    const unitCost = p.costPrice;
    const lineTotal = Number((quantity * unitCost).toFixed(2));
    netAmount += lineTotal;
    return {
      lineNumber: idx + 1,
      productId: p._id,
      sku: p.sku,
      productName: p.name,
      quantity,
      unitCost,
      vatRate: p.vatRate,
      lineTotal
    };
  });

  const vatAmount = Number((netAmount * 0.22).toFixed(2));
  const grossAmount = Number((netAmount + vatAmount).toFixed(2));

  const po = {
    _id: new ObjectId(),
    orderNumber: `PO-202${pick([4,5])}-${pad(i, 6)}`,
    supplierId: supplier._id,
    buyerEmployeeId: buyer._id,
    orderDate,
    expectedDeliveryDate: addDays(orderDate, supplier.leadTimeDays + randInt(0, 8)),
    status: pick(purchaseOrderStatuses),
    currency: "EUR",
    items,
    totals: {
      netAmount: Number(netAmount.toFixed(2)),
      vatAmount,
      grossAmount
    },
    notes: chance(25) ? "Ordine urgente" : null,
    createdAt: orderDate
  };

  purchaseOrders.push(po);
  purchaseOrderIds.push(po._id);
}
db.purchaseOrders.insertMany(purchaseOrders);

// =====================================================
// SALES ORDERS
// =====================================================
const allClients = db.clients.find().toArray();
const activeClients = allClients.filter(c => c.status !== "SUSPENDED");
const activeProducts = db.products.find({ status: "ACTIVE" }).toArray();

const salesOrders = [];
const salesOrderIds = [];

for (let i = 1; i <= 900; i++) {
  const client = pick(activeClients);
  const salesRep = salesReps.length ? pick(salesReps) : pick(employees);
  const orderDate = randomDate(new Date("2024-01-01"), new Date("2026-02-20"));
  const linesCount = randInt(1, 7);

  const chosenProducts = pickMany(activeProducts, linesCount, linesCount);

  let netAmount = 0;

  const items = chosenProducts.map((p, idx) => {
    const quantity = randInt(1, 20);
    const discountPct = pick([0, 0, 0, 5, 10, 15]);
    const lineBase = quantity * p.unitPrice;
    const discounted = lineBase * (1 - discountPct / 100);
    const lineTotal = Number(discounted.toFixed(2));
    netAmount += lineTotal;

    return {
      lineNumber: idx + 1,
      productId: p._id,
      sku: p.sku,
      productName: p.name,
      quantity,
      unitPrice: p.unitPrice,
      discountPct,
      vatRate: p.vatRate,
      lineTotal
    };
  });

  const discountAmount = Number((netAmount * pick([0, 0, 0.02, 0.03])).toFixed(2));
  const shippingCost = pick([0, 5.9, 8.5, 12.0, 18.0]);
  const finalNet = Number((netAmount - discountAmount).toFixed(2));
  const vatAmount = Number((finalNet * 0.22).toFixed(2));
  const grossAmount = Number((finalNet + vatAmount + shippingCost).toFixed(2));

  const shippingAddress = pick(client.addresses.filter(a => a.type === "SHIPPING")) || client.addresses[0];

  const so = {
    _id: new ObjectId(),
    orderNumber: `SO-${orderDate.getFullYear()}-${pad(i, 6)}`,
    clientId: client._id,
    salesRepId: salesRep._id,
    orderDate,
    status: pick(salesOrderStatuses),
    channel: pick(channels),
    currency: "EUR",
    paymentStatus: pick(paymentStatuses),
    shippingAddress,
    items,
    discountAmount,
    shippingCost,
    notes: chance(15) ? "Cliente richiede consegna rapida" : null,
    totals: {
      netAmount: finalNet,
      vatAmount,
      grossAmount
    },
    createdAt: orderDate,
    updatedAt: addDays(orderDate, randInt(0, 5))
  };

  salesOrders.push(so);
  salesOrderIds.push(so._id);
}
db.salesOrders.insertMany(salesOrders);

// =====================================================
// INVENTORY MOVEMENTS
// =====================================================
const movements = [];

// Initial stock
for (const product of allProducts) {
  const warehouse = pick(allWarehouses);
  movements.push({
    _id: new ObjectId(),
    movementDate: randomDate(new Date("2023-12-01"), new Date("2024-01-15")),
    productId: product._id,
    warehouseId: warehouse._id,
    movementType: "IN",
    quantity: randInt(30, 250),
    unitCost: product.costPrice,
    referenceType: "INITIAL_STOCK",
    referenceId: null,
    notes: "Carico iniziale",
    createdByEmployeeId: pick(employees)._id
  });
}

// Movements from purchase orders
for (const po of purchaseOrders) {
  if (po.status !== "CANCELLED") {
    for (const item of po.items) {
      movements.push({
        _id: new ObjectId(),
        movementDate: addDays(po.orderDate, randInt(2, 25)),
        productId: item.productId,
        warehouseId: pick(allWarehouses)._id,
        movementType: "IN",
        quantity: item.quantity,
        unitCost: item.unitCost,
        referenceType: "PURCHASE_ORDER",
        referenceId: po._id,
        notes: `Ricezione da ${po.orderNumber}`,
        createdByEmployeeId: pick(employees)._id
      });
    }
  }
}

// Movements from sales orders
for (const so of salesOrders) {
  if (so.status === "SHIPPED" || so.status === "DELIVERED") {
    for (const item of so.items) {
      movements.push({
        _id: new ObjectId(),
        movementDate: addDays(so.orderDate, randInt(0, 7)),
        productId: item.productId,
        warehouseId: pick(allWarehouses)._id,
        movementType: "OUT",
        quantity: item.quantity,
        unitCost: randFloat(3, 500, 2),
        referenceType: "SALES_ORDER",
        referenceId: so._id,
        notes: `Spedizione per ${so.orderNumber}`,
        createdByEmployeeId: pick(employees)._id
      });
    }
  }
}

// Transfer and adjustment movements
for (let i = 1; i <= 700; i++) {
  const product = pick(allProducts);
  const wh1 = pick(allWarehouses);
  const wh2 = pick(allWarehouses.filter(w => w._id.valueOf() !== wh1._id.valueOf()));
  const when = randomDate(new Date("2024-01-01"), new Date("2026-02-28"));
  const qty = randInt(1, 30);

  movements.push({
    _id: new ObjectId(),
    movementDate: when,
    productId: product._id,
    warehouseId: wh1._id,
    movementType: "TRANSFER_OUT",
    quantity: qty,
    unitCost: product.costPrice,
    referenceType: "TRANSFER",
    referenceId: null,
    notes: "Trasferimento interno",
    createdByEmployeeId: pick(employees)._id
  });

  movements.push({
    _id: new ObjectId(),
    movementDate: addDays(when, 1),
    productId: product._id,
    warehouseId: wh2._id,
    movementType: "TRANSFER_IN",
    quantity: qty,
    unitCost: product.costPrice,
    referenceType: "TRANSFER",
    referenceId: null,
    notes: "Trasferimento interno",
    createdByEmployeeId: pick(employees)._id
  });
}

for (let i = 1; i <= 250; i++) {
  const product = pick(allProducts);
  movements.push({
    _id: new ObjectId(),
    movementDate: randomDate(new Date("2024-01-01"), new Date("2026-02-28")),
    productId: product._id,
    warehouseId: pick(allWarehouses)._id,
    movementType: "ADJUSTMENT",
    quantity: pick([-5, -3, -2, -1, 1, 2, 3, 5, 8]),
    unitCost: product.costPrice,
    referenceType: "MANUAL",
    referenceId: null,
    notes: "Rettifica inventariale",
    createdByEmployeeId: pick(employees)._id
  });
}

db.inventoryMovements.insertMany(movements);

// =====================================================
// SUMMARY
// =====================================================
print("Database company_demo creato con successo.");
print("Collections:");
print(" - clients: " + db.clients.countDocuments());
print(" - suppliers: " + db.suppliers.countDocuments());
print(" - employees: " + db.employees.countDocuments());
print(" - warehouses: " + db.warehouses.countDocuments());
print(" - products: " + db.products.countDocuments());
print(" - purchaseOrders: " + db.purchaseOrders.countDocuments());
print(" - salesOrders: " + db.salesOrders.countDocuments());
print(" - inventoryMovements: " + db.inventoryMovements.countDocuments());
<div align="center">
  <a href="http://remult.dev/">
    <img src="https://github.com/remult/remult/raw/master/docs/.vuepress/public/logo.png" width="140" height="140">
  </a>
  <h1>Remult</h1>
	<img alt="GitHub license" src="https://img.shields.io/badge/license-MIT-blue.svg">
	<a href="https://badge.fury.io/js/remult">
		<img alt="npm version" src="https://badge.fury.io/js/remult.svg">
	</a>
</div>

## What is Remult?

**Remult** is a fullstack CRUD framework which uses your TypeScript model types to provide:

* Secured REST API (highly configurable)
* Type-safe frontend API client
* Type-safe backend query builder

### Remult :heart: Monorepos

Using a `monorepo` approach, with model types shared between frontend and backend code, Remult can enforce data validation and constraints, defined once, on both frontend and REST API level.


## Installation
```sh
npm i remult
```

### Setup API backend using a Node.js Express middleware
```ts
import express from 'express';
import { remultExpress } from 'remult/remult-express';

const port = 3001;
const app = express();

app.use(remultExpress());

app.listen(port, () => {
  console.log(`Example API listening at http://localhost:${port}`);
});
```

## Define model classes
```ts
import { Entity, EntityBase, Field } from 'remult';

@Entity('products', {
    allowApiCrud: true
})
export class Product extends EntityBase {
  @Field()
  name: string = '';

  @Field()
  unitPrice: number = 0;
}
```

### :rocket: API Ready
```sh
> curl http://localhost:3001/api/products

[{"name":"Tofu","unitPrice":5}]
```

## Find and manipulate data in type-safe frontend code
```ts
async function increasePriceOfTofu(priceIncrease: number) {
  const product = await remult.repo(Product).findFirst({ name: 'Tofu' });

  product.unitPrice += priceIncrease;
  product.save();
}
```

### ...*exactly* the same way as in backend code
```ts
@BackendMethod({ allowed: Allow.authenticated })
static async increasePriceOfTofu(priceIncrease: number, remult?: Remult) {
  const product = await remult!.repo(Product).findFirst({ name: 'Tofu' });

  product.unitPrice += priceIncrease;
  product.save();
}
```

## :ballot_box_with_check: Data validation and constraints - defined once

```ts
import { Entity, EntityBase, Field } from 'remult';
import { Min } from 'class-validator';

@Entity('products', {
    allowApiCrud: true
})
export class Product extends EntityBase {
    @Field<Product>({
        validate: p => {
            if (p.name.trim().length == 0)
                p.$.name.error = 'required';
        }
    })
    name: string = '';

    @Field()
    @Min(0)
    unitPrice: number = 0;
}
```

### Enforced in frontend:
```ts
const product = remult.repo(Product).create();

try {
  await product.save();
}
catch {
  console.error(product._.error); // Browser console will display - "Name: required"
}
```

### Enforced in backend:
```sh
> curl -d "{""unitPrice"":-1}" -H "Content-Type: application/json" -X POST http://localhost:3001/api/products

{"modelState":{"unitPrice":"unitPrice must not be less than 0","name":"required"},"message":"Name: required"}
```

## :lock: Secure the API with fine-grained authorization
```ts
@Entity<Article>('Articles', {
    allowApiRead: true,
    allowApiInsert: remult => remult.authenticated(),
    allowApiUpdate: (remult, article) => article.author.id == remult.user.id
})
export class Article extends EntityBase {
    @Field({ allowApiUpdate: false })
    slug: string;
    
    @Field({ allowApiUpdate: false })
    author: Profile;

    @Field()
    content: string;
}
```

## Getting started
The best way to learn Remult is by following a tutorial of a simple fullstack Todo app using [React](https://remult.dev/tutorials/tutorial-react.html) or [Angular](https://remult.dev/tutorials/tutorial-angular.html).

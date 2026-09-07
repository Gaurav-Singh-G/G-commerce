import {Category} from "@/models/Category";
import {mongooseConnect} from "@/lib/mongoose";
import {authorizeAdminRequest} from "@/lib/authorizeAdminRequest";

export default async function handle(req, res) {
  const {method} = req;
  try {await mongooseConnect()
  } catch(err) {
    console.log(err)
  }
  await authorizeAdminRequest(req,res);

  if (method === 'GET') {
    res.json(await Category.find().populate('parent')
    );
  }

  if (method === 'POST') {
    const {name,parentCategory,properties
    } = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === 'PUT') {
    const {name,parentCategory,properties,_id} = req.body;
    const categoryDoc = await Category.updateOne({_id},{
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === 'DELETE') {
    const {_id} = req.query;
    await Category.deleteOne({_id});
    res.json('ok');
  }
}
import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';

export const loader = async ({request}) => {
  try {
    const dimension = await db.dimension.findMany({
      select: { id: true, option: true, multiple: true },
    });
    const material = await db.material.findMany({
      select: { id: true, option: true, price: true },
    });

    const response = json({
      data: {
        dimension,
        material,
      },
    });

    return cors(request, response);

  } catch (err) {
    console.error("API error:", err);
    return json({ error: `Internal Server Error: ${err}` }, { status: 500 });
  }
};


export const action = async ({ request }) => {
    try {
      const formData = await request.formData();
  
      const type = formData.get("type"); // "dimension" or "material"
      const option = formData.get("option");
      const price = parseInt(formData.get("price"), 10);
      const multiple = formData.get("multiple");

      if ((!type || !option || isNaN(price)) || (type === "dimension" && !multiple)){
        return json({ error: "Missing or invalid fields" }, { status: 400 });
      }
  
      let record;
      if (type === "dimension") {
        record = await db.dimension.create({
          data: { option, multiple },
        });
      } else if (type === "material") {
        record = await db.material.create({
          data: { option, price },
        });
      } else {
        return json({ error: "Invalid type" }, { status: 400 });
      }
  
      const response = json({ success: true, record });

      return cors(request, response);
    } catch (err) {
      console.error("Action error:", err);
      return json({ error: `Internal Server Error: ${err.message}` }, { status: 500 });
    }
  };

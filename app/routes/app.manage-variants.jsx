import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import db from "../db.server";
import { useState, useCallback } from "react";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  DataTable,
  Frame,
  Toast,
} from "@shopify/polaris";
import React, {useEffect, useState} from 'react'

/* ----------------- Loader ----------------- */
export const loader = async () => {
  try {
    const dimension = await db.dimension.findMany({ select: { id: true, option: true, price: true } });
    const material = await db.material.findMany({ select: { id: true, option: true, price: true } });
    return json({ dimension, material });
  } catch (err) {
    console.error("Loader error:", err);
    return json({ dimension: [], material: [] });
  }
};

/* ----------------- Action ----------------- */
export const action = async ({ request }) => {
  try {
    const formData = await request.formData();
    const boyEnData = JSON.parse(formData.get("dimension") || "[]");
    const materialData = JSON.parse(formData.get("material") || "[]");

    await db.dimension.deleteMany({});
    if (boyEnData.length) await db.dimension.createMany({ data: boyEnData });

    await db.material.deleteMany({});
    if (materialData.length) await db.material.createMany({ data: materialData });

    return json({ ok: true, message: "Changes saved successfully ✅" });
  } catch (err) {
    console.error("Action error:", err);
    return json({ ok: false, message: "Something went wrong ❌" }, { status: 500 });
  }
};

/* ----------------- React Component ----------------- */
export default function AdminCustomVariants() {
  const data = useLoaderData();
  const actionData = useActionData();

  const [boyEnList, setBoyEnList] = useState(data.dimension);
  const [materialList, setMaterialList] = useState(data.material);

  const [newBoyEn, setNewBoyEn] = useState("");
  const [newBoyEnPrice, setNewBoyEnPrice] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newMaterialPrice, setNewMaterialPrice] = useState("");

  const [toastActive, setToastActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const toggleToastActive = useCallback(() => setToastActive((active) => !active), []);

  // show toast when action returns a message
  useEffect(() => {
    if (actionData?.message) {
      setToastMsg(actionData.message);
      setToastActive(true);
    }
  }, [actionData]);

  const addBoyEn = () => {
    if (!newBoyEn || !newBoyEnPrice) return;
    setBoyEnList([...boyEnList, { option: newBoyEn, price: parseInt(newBoyEnPrice) }]);
    setNewBoyEn("");
    setNewBoyEnPrice("");
    setToastMsg("Boy x En option added ✅");
    setToastActive(true);
  };

  const addMaterial = () => {
    if (!newMaterial || !newMaterialPrice) return;
    setMaterialList([...materialList, { option: newMaterial, price: parseInt(newMaterialPrice) }]);
    setNewMaterial("");
    setNewMaterialPrice("");
    setToastMsg("Material option added ✅");
    setToastActive(true);
  };

  const deleteBoyEn = (index) => {
    setBoyEnList(boyEnList.filter((_, i) => i !== index));
    setToastMsg("Boy x En option deleted ❌");
    setToastActive(true);
  };

  const deleteMaterial = (index) => {
    setMaterialList(materialList.filter((_, i) => i !== index));
    setToastMsg("Material option deleted ❌");
    setToastActive(true);
  };

  return (
    <Frame>
      <Page title="Custom Variants Admin">
        <Form method="post">
          <Card sectioned>
            <FormLayout>
              <h3>Boy x En Options</h3>
              <TextField label="Option" value={newBoyEn} onChange={setNewBoyEn} />
              <TextField label="Price" type="number" value={newBoyEnPrice} onChange={setNewBoyEnPrice} />
              <Button primary onClick={addBoyEn}>Add</Button>

              <DataTable
                columnContentTypes={["text","text","text"]}
                headings={["Option","Price","Actions"]}
                rows={boyEnList.map((item,i)=>[
                  item.option,
                  item.price,
                  <Button destructive size="slim" onClick={()=>deleteBoyEn(i)}>Delete</Button>
                ])}
              />

              <h3>Material Options</h3>
              <TextField label="Material" value={newMaterial} onChange={setNewMaterial} />
              <TextField label="Price" type="number" value={newMaterialPrice} onChange={setNewMaterialPrice} />
              <Button primary onClick={addMaterial}>Add</Button>

              <DataTable
                columnContentTypes={["text","text","text"]}
                headings={["Material","Price","Actions"]}
                rows={materialList.map((item,i)=>[
                  item.option,
                  item.price,
                  <Button destructive size="slim" onClick={()=>deleteMaterial(i)}>Delete</Button>
                ])}
              />

              {/* Hidden fields for form submission */}
              <input type="hidden" name="dimension" value={JSON.stringify(boyEnList)} />
              <input type="hidden" name="material" value={JSON.stringify(materialList)} />

              <Button primary submit>Save Changes</Button>
            </FormLayout>
          </Card>
        </Form>

        {toastActive && (
          <Toast content={toastMsg} onDismiss={toggleToastActive} duration={3000} />
        )}
      </Page>
    </Frame>
  );
}

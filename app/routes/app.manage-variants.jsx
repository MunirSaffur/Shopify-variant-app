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
  Text,
  LegacyCard
} from "@shopify/polaris";
import React, {useEffect} from 'react'

/* ----------------- Loader ----------------- */
export const loader = async () => {
  try {
    const dimension = await db.dimension.findMany({ select: { id: true, option: true, multiple: true } });
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
    return json({ ok: false, message: `Something went wrong: ${err}` }, { status: 500 });
  }
};

/* ----------------- React Component ----------------- */
export default function AdminCustomVariants() {
  const data = useLoaderData();
  const actionData = useActionData();

  const [dimensionsList, setDimensionsList] = useState(data.dimension);
  const [materialList, setMaterialList] = useState(data.material);

  const [newDimension, setNewDimension] = useState("");
  const [newDimensionPrice, setNewDimensionPrice] = useState("");
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
    if (!newDimension || !newDimensionPrice) return;
    setDimensionsList([...dimensionsList, { option: newDimension, multiple: parseInt(newDimensionPrice) }]);
    setNewDimension("");
    setNewDimensionPrice("");
    setToastMsg("✅ Dimension option added, click on Save Changes");
    setToastActive(true);
  };

  const addMaterial = () => {
    if (!newMaterial || !newMaterialPrice) return;
    setMaterialList([...materialList, { option: newMaterial, price: parseInt(newMaterialPrice) }]);
    setNewMaterial("");
    setNewMaterialPrice("");
    setToastMsg("✅ Material option added, click on Save Changes");
    setToastActive(true);
  };

  const deleteBoyEn = (index) => {
    setDimensionsList(dimensionsList.filter((_, i) => i !== index));
    setToastMsg("Dimension removed from the list, click on Save Changes");
    setToastActive(true);
  };

  const deleteMaterial = (index) => {
    setMaterialList(materialList.filter((_, i) => i !== index));
    setToastMsg("Material removed from the list, click on Save Changes");
    setToastActive(true);
  };

  return (
    <Frame>
      <Page title="Custom Variants Admin">
        <Form method="post">
          <Card sectioned>
            <FormLayout>
              <Text variant="headingLg" as="h4">Dimension Options</Text>
              <TextField label="Option" value={newDimension} onChange={setNewDimension} />
              <TextField label="multiple" type="number" value={newDimensionPrice} onChange={setNewDimensionPrice} />
              <Button primary onClick={addBoyEn}>Add</Button>

            <LegacyCard>
              <DataTable
                columnContentTypes={["text","text","text"]}
                headings={["Variant","Multiple","Actions"]}
                rows={dimensionsList.map((item,i)=>[
                  item.option,
                  item.multiple,
                  <Button destructive size="slim" onClick={()=>deleteBoyEn(i)}>Remove</Button>
                ])}
              />
              </LegacyCard>

              <Text variant="headingLg" as="h4">Material Options</Text>
              <TextField label="Material" value={newMaterial} onChange={setNewMaterial} />
              <TextField label="Price" type="number" value={newMaterialPrice} onChange={setNewMaterialPrice} />
              <Button primary onClick={addMaterial}>Add</Button>

            <LegacyCard>
              <DataTable
                columnContentTypes={["text","text","text"]}
                headings={["Material","Price","Actions"]}
                rows={materialList.map((item,i)=>[
                  item.option,
                  item.price,
                  <Button destructive size="slim" onClick={()=>deleteMaterial(i)}>Remove</Button>
                ])}
              />
            </LegacyCard>

              {/* Hidden fields for form submission */}
              <input type="hidden" name="dimension" value={JSON.stringify(dimensionsList)} />
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

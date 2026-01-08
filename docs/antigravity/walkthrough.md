# Walkthrough - QuoterPro

## Completed Modules
1. **Company Management**: Multi-company support, configuration, and context switching.
2. **Catalog Management**: Product/Service CRUD with specialized calculation types (Fixed, ML, M2).

## Verification Steps

### 1. Run the Application
```bash
npm run dev
```

### 2. Company Management (Prerequisite)
1. Go to **Configuración** (`/settings`).
2. Ensure you have at least one company created and **selected** (marked as "Activa").

### 3. Catalog Management
1. Click on **Catálogo** in the sidebar.
2. **Create Product**:
   - Click **Nuevo Producto**.
   - Fill in **Nombre** (e.g., "Tubo PVC") and **Categoría** (e.g., "Plomería").
   - **Verify SKU**: Notice that the SKU field is automatically populated (e.g., "TUBPLO-001").
   - Fill in Price ($100).
   - Select **Calculation Type**:
     - **Fijo**: Sets Unit to "PZ".
     - **Metro Lineal**: Sets Unit to "ML".
     - **Metro Cuadrado**: Sets Unit to "M2".
   - **Verify Unit**: Check that "Unidad de Medida" updates automatically.
   - Click **Guardar**.
3. **List View**:
   - Verify the new product appears in the list with its **Category**.
   - Use the **Delete** button (Trash icon) to remove a product.
   - Click **Categorías** to open the Category Manager.
     - Add a new category.
     - Delete an existing category.

     - Delete an existing category.

### 4. Quote Management
1. **Dashboard**:
   - Go to **Cotizaciones**.
   - Verify the list is empty (or shows existing quotes).
2. **Create Quote**:
   - Click **Nueva Cotización**.
   - **Customer**: Type a name (e.g., "Cliente Prueba"). It should auto-save to the list for future use.
   - **Add Items**:
     - Click **Agregar Partida**.
     - Select a product (e.g., the one created earlier).
     - If it's M2, enter Width and Height. Verify the **Importe** updates.
   - **Totals**: Verify Subtotal, IVA, and Total are correct.
   - Click **Guardar Cotización**.
3. **Edit Quote**:
   - Click **Ver / Editar** on the quote in the list.
   - Modify an item and save again.
   - Click **Imprimir / PDF**.
   - Verify that the browser's print dialog opens with the correct format.
   - **Check Layout**: "Folio", "Vigencia", "Cliente" info, and Column Order (Qty first).
   - **Check IVA**: Verify IVA row appears/disappears based on the toggle.
   - **Check Dimensions**: Verify dimensions appear with correct unit (m/cm) if applicable.
   - **Check Notes**: Verify "Notas Adicionales" section appears at the bottom.
   - **Check Footer**: Verify pagination "Página X de Y" (in print preview) and "Generado por QuoterPro".

### 5. Data Isolation Check
1. Switch to a different company in **Configuración**.
2. Go back to **Catálogo**.
3. Verify that the list is empty (or shows only products for that specific company).

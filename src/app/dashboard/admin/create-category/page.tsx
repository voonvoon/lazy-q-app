'use client'

import { useMerchant } from '@/contexts/MerchantContext';
import { useState } from 'react';
import { createCategory } from '@/lib/actions/category';

export default function CreateCategoryPage() {
  const { selectedMerchant } = useMerchant();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!selectedMerchant) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold mb-2">Please select a restaurant first</h2>
        <p className="text-gray-600">You need to select a merchant before creating a category.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const result = await createCategory({ name, merchantId: selectedMerchant._id });
      if (result.success) {
        setSuccessMsg('Category created!');
        setName('');
      } else {
        setErrorMsg(result.error || 'Failed to create category.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-black">Create New Category</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="categoryName">
            Category Name
          </label>
          <input
            id="categoryName"
            name="categoryName"
            type="text"
            className="w-full border rounded px-3 py-2 text-black focus:outline-none focus:ring-2"
            placeholder="e.g. Appetizers"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        {successMsg && (
          <div className="mb-4 text-green-600">{successMsg}</div>
        )}
        {errorMsg && (
          <div className="mb-4 text-red-600">{errorMsg}</div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
}
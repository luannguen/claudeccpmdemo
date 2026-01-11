import React from "react";
import { Edit, Trash2, Move } from "lucide-react";

export default function CategoryTableView({ categories, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Icon</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Tên</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Key</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Mô tả</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Thứ tự</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {cat.icon}
                  </div>
                </td>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4">
                  <code className="bg-gray-50 px-2 py-1 rounded text-sm">{cat.key}</code>
                </td>
                <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{cat.description || '-'}</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <Move className="w-3 h-3" />
                    #{cat.display_order}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    cat.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => onEdit(cat)}
                      className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(cat)}
                      className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
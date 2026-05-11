import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/common/UIComponents';
import { Plus, Search, Filter } from 'lucide-react';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaigns</h1>
          <p className="text-gray-600">Manage and browse campaigns</p>
        </div>
        <Button size="lg" className="flex items-center gap-2 w-full md:w-auto">
          <Plus size={20} /> Create Campaign
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none">
          <option value="all">All Types</option>
          <option value="creator">Creator</option>
          <option value="sponsor">Sponsor</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Card key={campaign._id} className="group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                <Badge variant="primary">{campaign.type}</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-semibold">Budget:</span> ${campaign.budget}</p>
                <p className="text-sm"><span className="font-semibold">Status:</span> {campaign.status}</p>
              </div>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-gray-600 text-lg">No campaigns yet. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';

interface CustomInstructionsPageProps {
  fileName: string;
  onSubmit: (instructions: string) => void;
  onBack: () => void;
}

export const CustomInstructionsPage: React.FC<CustomInstructionsPageProps> = ({
  fileName,
  onSubmit,
  onBack
}) => {
  const [instructions, setInstructions] = useState('');

  const exampleInstructions = [
    "Make all headings bold and size 16pt, body text should be 12pt Times New Roman",
    "Make all level 1 headings 16pt and bold.",
    "Change the font for all body paragraphs to 'Arial'",
    "Format this document as a standard academic paper. Use Times New Roman font throughout. The main text should be 12pt, and all headings should be 12pt and bold. Also, set the line spacing for the entire document to double (2.0).",
    "Find every instance of the phrase 'CONFIDENTIAL' and make it bold, uppercase, and change its font to Arial",
    "Please make all headings bold and change their font to 'Century Gothic'",
    "I want a specific style: make the level 1 heading Arial, size 20. All other headings (level 2, 3, etc.) and all body paragraphs should be in Garamond, size 12"
  ];

  const handleSubmit = () => {
    if (instructions.trim()) {
      onSubmit(instructions);
    }
  };

  const handleExampleClick = (example: string) => {
    setInstructions(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-full border border-orange-200">
            <Wand2 className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              Custom Formatting
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Tell Us What You Want
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your formatting requirements in plain English. Our AI will understand and apply them perfectly.
          </p>
        </div>

        {/* File Info */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wand2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formatting Document</p>
                  <p className="font-medium text-gray-900">{fileName}</p>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                Ready for Instructions
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Input */}
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span>Your Formatting Instructions</span>
            </CardTitle>
            <CardDescription>
              Be as specific or general as you like. The AI understands natural language!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Make all headings bold and 16pt, use Times New Roman for body text, add page numbers, and ensure 1.5 line spacing throughout..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[200px] text-base resize-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{instructions.length} characters</span>
              <span className="text-orange-600">
                {instructions.length > 0 ? '✓ Instructions provided' : 'Waiting for instructions...'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Example Instructions */}
        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <span>Example Instructions</span>
            </CardTitle>
            <CardDescription>
              Click any example to use it as a starting point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exampleInstructions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-600 font-medium text-sm mt-0.5">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {example}
                    </p>
                    <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-gray-300 hover:border-gray-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!instructions.trim()}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
          >
            Start Formatting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Help Text */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Tips for Better Results:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Be specific about fonts, sizes, and spacing</li>
                  <li>Mention any special formatting needs (headers, footers, page numbers)</li>
                  <li>Describe the overall style you want (professional, academic, modern)</li>
                  <li>Include any specific requirements for tables, lists, or images</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

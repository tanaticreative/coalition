<?php

namespace App\Controllers;

use App\Models\Product;
use Engine\Controller;
use Engine\Validator;

class ProductController extends Controller
{

    public function indexAction()
    {
        $this->render('home');
    }

    public function updateAction()
    {
        try {
            $product = (new Product())->load($this->params['id']);
        } catch (\Exception $e) {
            $this->response->error($e->getMessage());
        }

        $rules = [
            'name' => 'required',
            'quantity' => 'required|int',
            'price' => 'required|numeric'
        ];

        try {
            $innerData = json_decode(file_get_contents("php://input"), true);
            $data = Validator::validate($innerData, $rules);
            $result = $product->update($data);
        } catch (\Exception $e) {
            $this->response->error($e->getMessage());
        }

        $this->response->send(['success' => $result]);
    }

    public function deleteAction()
    {
        try {
            $product = (new Product())->load($this->params['id']);
            $product->delete();
        } catch (\Exception $e) {
            $this->response->error($e->getMessage());
        }

        $this->response->send(['success' => true]);
    }

    public function createAction()
    {
        $rules = [
            'name' => 'required',
            'quantity' => 'required|int',
            'price' => 'required|numeric'
        ];

        try {
            $innerData = json_decode(file_get_contents("php://input"), true);

            $product = new Product();
            $data = Validator::validate($innerData, $rules);
            $product->create($data);
        } catch (\Exception $e) {
            $this->response->error($e->getMessage());
        }

        $this->response->send(['success' => true]);
    }

    public function getAllAction()
    {
        try {
            $product = new Product();
            $result = $product->getList();
        } catch (\Exception $e) {
            $this->response->error($e->getMessage());
        }

        $this->response->send(['success' => true, 'products' => $result]);
    }
}
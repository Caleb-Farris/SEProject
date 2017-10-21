using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SEProject.Pages
{
    public class TestController : Controller
    {
        public string Poly { get; set; }


        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        // AJAX call
        [HttpGet]
        public IActionResult GetPoly()
        {
            Poly = "DUDU TIME";
            return View("Tutorial", Poly);
        }
    }
}

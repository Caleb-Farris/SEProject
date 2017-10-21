using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.RegularExpressions;

namespace SEProject.Pages
{
    public class TutorialModel : PageModel
    {
        public string Poly { get; set; }

        public IActionResult OnGet(string polyString)
        {
            Poly = polyString;
            return Page();
        }
    }
}